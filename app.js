import { handleToolsToolTip } from './features/toolsTooltip.js'
import { toolSelector } from './features/toolsSelect.js'
import { switchTab } from './features/switchTab.js'
import { createResizeHandles, createRotationHandle, handleResize, handleRotation } from './features/handles.js'
import { PropertiesPanel } from './features/propertiesPanel.js'

let elements = []
let id = 0
let mode = 'select'
let tab = 'create'
let currentTool = 'select'
let selectedItemId = null
let propertiesPanel = null

// DOM selections
const canvas = document.querySelector('#canvas')
const selectTool = document.querySelector('#select');
const squareTool = document.querySelector('#square');
const circleTool = document.querySelector('#circle');
const lineTool = document.querySelector('#line');
const textTool = document.querySelector('#text');
const toolsTooltip = document.querySelector('#tools-tooltip')
const tabs = document.querySelectorAll('.tab')

const toolsTooltipData = [
    { element: selectTool, label: 'Selection (V)' },
    { element: squareTool, label: 'Rectangle (R)' },
    { element: circleTool, label: 'Circle (C)' },
    { element: lineTool, label: 'Line (L)' },
    { element: textTool, label: 'Text (T)' }
]

// Initialize Properties Panel
propertiesPanel = new PropertiesPanel(
    () => elements,
    (newElements) => { elements = newElements },
    renderElements
)

handleToolsToolTip(toolsTooltip, toolsTooltipData)

toolSelector(document.querySelector(`#${currentTool}`))

// Dimension panel
function createDimensionPanel(width, height, rotation = 0, isLine = false) {
    const div = document.createElement('div')
    div.classList.add("dimension", "pointer-events-none", "z-[999]", "text-white", "font-sans", "text-xs", "absolute", "px-3", "h-6", "rounded", "bg-blue-500", "flex", "justify-center", "items-center", "min-w-15", "whitespace-nowrap")
    
    let absWidth = Math.abs(width)
    let absHeight = Math.abs(height)
    div.textContent = isLine ? `${Math.round(absWidth)}` : `${Math.round(absWidth)} × ${Math.round(absHeight)}`
    
    // Switch which local edge to attach to based on which faces downward in world space
    // Counter-rotate the panel to keep text horizontal and readable
    const normalizedRotation = ((rotation || 0) % 360 + 360) % 360
    
    if (normalizedRotation >= 45 && normalizedRotation < 135) {
        // Rotated ~90° - local right edge faces down
        div.style.left = '100%'
        div.style.top = '50%'
        div.style.right = ''
        div.style.bottom = ''
        div.style.marginLeft = '8px'
        div.style.marginTop = '0'
        div.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`
    } else if (normalizedRotation >= 135 && normalizedRotation < 225) {
        // Rotated ~180° - local top edge faces down
        div.style.left = '50%'
        div.style.top = '-32px'
        div.style.right = ''
        div.style.bottom = ''
        div.style.marginLeft = '0'
        div.style.marginTop = '0'
        div.style.transform = `translateX(-50%) rotate(${-rotation}deg)`
    } else if (normalizedRotation >= 225 && normalizedRotation < 315) {
        // Rotated ~270° - local left edge faces down
        div.style.right = '100%'
        div.style.top = '50%'
        div.style.left = ''
        div.style.bottom = ''
        div.style.marginRight = '8px'
        div.style.marginLeft = '0'
        div.style.marginTop = '0'
        div.style.transform = `translate(50%, -50%) rotate(${-rotation}deg)`
    } else {
        // Normal - local bottom edge faces down
        div.style.left = '50%'
        div.style.top = ''
        div.style.right = ''
        div.style.bottom = '-32px'
        div.style.marginLeft = '0'
        div.style.marginTop = '0'
        div.style.marginRight = '0'
        div.style.transform = `translateX(-50%) rotate(${-rotation}deg)`
    }
    
    return div
}
function updateDimensionPanel(panel, width, height, rotation = 0, isLine = false) {
    let absWidth = Math.abs(width)
    let absHeight = Math.abs(height)
    panel.textContent = isLine ? `${Math.round(absWidth)}` : `${Math.round(absWidth)} × ${Math.round(absHeight)}`
    
    // Update position based on rotation
    const normalizedRotation = ((rotation || 0) % 360 + 360) % 360
    
    if (normalizedRotation >= 45 && normalizedRotation < 135) {
        // Rotated ~90° - local right edge faces down
        panel.style.left = '100%'
        panel.style.top = '50%'
        panel.style.right = ''
        panel.style.bottom = ''
        panel.style.marginLeft = '8px'
        panel.style.marginTop = '0'
        panel.style.marginRight = '0'
        panel.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`
    } else if (normalizedRotation >= 135 && normalizedRotation < 225) {
        // Rotated ~180° - local top edge faces down
        panel.style.left = '50%'
        panel.style.top = '-32px'
        panel.style.right = ''
        panel.style.bottom = ''
        panel.style.marginLeft = '0'
        panel.style.marginTop = '0'
        panel.style.marginRight = '0'
        panel.style.transform = `translateX(-50%) rotate(${-rotation}deg)`
    } else if (normalizedRotation >= 225 && normalizedRotation < 315) {
        // Rotated ~270° - local left edge faces down
        panel.style.right = '100%'
        panel.style.top = '50%'
        panel.style.left = ''
        panel.style.bottom = ''
        panel.style.marginRight = '8px'
        panel.style.marginLeft = '0'
        panel.style.marginTop = '0'
        panel.style.transform = `translate(50%, -50%) rotate(${-rotation}deg)`
    } else {
        // Normal - local bottom edge faces down
        panel.style.left = '50%'
        panel.style.top = ''
        panel.style.right = ''
        panel.style.bottom = '-32px'
        panel.style.marginLeft = '0'
        panel.style.marginTop = '0'
        panel.style.marginRight = '0'
        panel.style.transform = `translateX(-50%) rotate(${-rotation}deg)`
    }
}

selectTool.addEventListener('click', () => {
    canvas.style.cursor = 'default' //for selection tool
    mode = 'select'
    currentTool = 'select'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
squareTool.addEventListener('click', () => {
    canvas.style.cursor = 'default' //for selection tool
    mode = 'draw'
    currentTool = 'square'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
circleTool.addEventListener('click', () => {
    canvas.style.cursor = 'default' //for selection tool
    mode = 'draw'
    currentTool = 'circle'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
lineTool.addEventListener('click', () => {
    canvas.style.cursor = 'default' //for selection tool
    mode = 'draw'
    currentTool = 'line'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
textTool.addEventListener('click', () => {
    canvas.style.cursor = 'text'
    mode = 'draw'
    currentTool = 'text'
    console.log('Mode:', mode, '| Tool:', currentTool)
})

canvas.addEventListener('mousedown', handleMouseDown)
function handleMouseDown(e) {
    const target = e.target
    
    // Check if clicking on resize handle
    if (target.classList.contains('resize-handle')) {
        const syncCallback = () => {
            if (propertiesPanel && selectedItemId) {
                propertiesPanel.onSelectionChange(selectedItemId, true)
            }
        }
        handleResize(e, target, elements, renderElements, syncCallback)
        return
    }
    
    // Check if clicking on rotation handle
    if (target.classList.contains('rotation-handle')) {
        const syncCallback = () => {
            if (propertiesPanel && selectedItemId) {
                propertiesPanel.onSelectionChange(selectedItemId, true)
            }
        }
        handleRotation(e, target, elements, renderElements, syncCallback)
        return
    }
    
    console.log(tab, mode)
    if (tab === 'create' && mode === 'draw') {
        // Handle text tool differently - single click placement
        if (currentTool === 'text') {
            const x = e.clientX
            const y = e.clientY
            
            id = id + 1
            const currentId = id
            
            // Create text element
            const textElement = {
                id: currentId,
                type: 'text',
                x: x,
                y: y,
                width: 'auto',
                height: 'auto',
                fontSize: 16,
                text: 'Text',
                isNewlyCreated: true,
                isSelected: true,
                styles: {
                    borderWidth: '0px',
                    borderColor: '#000000',
                    backgroundColor: 'transparent',
                    borderRadius: '0px'
                }
            }
            
            elements.push(textElement)
            selectedItemId = currentId
            
            // Switch to select mode
            mode = 'select'
            currentTool = 'select'
            textTool.style.backgroundColor = 'transparent'
            selectTool.style.backgroundColor = '#0E81E6'
            toolSelector(document.querySelector('#select'))
            
            renderElements()
            
            // Sync properties panel to newly created text element
            if (propertiesPanel) {
                propertiesPanel.onSelectionChange(currentId)
            }
            
            // Focus the text element after rendering
            setTimeout(() => {
                const textDiv = canvas.querySelector(`[data-element="${currentId}"] .text-content`)
                if (textDiv) {
                    textDiv.focus()
                    // Select all text
                    const range = document.createRange()
                    range.selectNodeContents(textDiv)
                    const selection = window.getSelection()
                    selection.removeAllRanges()
                    selection.addRange(range)
                }
            }, 0)
            
            return
        }
        
        canvas.style.cursor = 'crosshair' //for selection tool
        let type = currentTool
        let x = e.clientX
        let y = e.clientY
        let width = 0
        let height = 0
        let styles = {
            borderWidth: '2px',
            borderColor: 'transparent',
            backgroundColor: '#D4D4D4',
            borderRadius: '0px'
        }

        // For lines, we'll store rotation angle
        let angle = 0

        id = id + 1
        let currentId = id

        const tempDiv = document.createElement('div')

        // Create dimension panel once
        const dimensionPanel = createDimensionPanel(0, 0, 0, type === 'line')
        tempDiv.appendChild(dimensionPanel)

        function handleMouseMove(e) {
            width = e.clientX - x
            height = e.clientY - y

            //apply all the properties to the tempDiv
            tempDiv.style.position = 'absolute'
            tempDiv.style.borderWidth = styles.borderWidth
            tempDiv.style.borderColor = styles.borderColor
            tempDiv.style.backgroundColor = styles.backgroundColor

            if (currentTool === 'square') {
                if (width > 0) tempDiv.style.left = `${x}px`
                else tempDiv.style.left = `${x + width}px`
                if (height > 0) tempDiv.style.top = `${y}px`
                else tempDiv.style.top = `${y + height}px`
                tempDiv.style.width = `${Math.abs(width)}px`
                tempDiv.style.height = `${Math.abs(height)}px`
                styles.borderRadius = '0px'
                tempDiv.style.borderRadius = styles.borderRadius

                // Update dimension panel for square
                updateDimensionPanel(dimensionPanel, width, height, 0)
            } else if (currentTool === 'circle') {
                if (width > 0) tempDiv.style.left = `${x}px`
                else tempDiv.style.left = `${x + width}px`
                if (height > 0) tempDiv.style.top = `${y}px`
                else tempDiv.style.top = `${y + height}px`
                tempDiv.style.width = `${Math.abs(width)}px`
                tempDiv.style.height = `${Math.abs(height)}px`
                styles.borderRadius = '100%'
                tempDiv.style.borderRadius = styles.borderRadius

                // Update dimension panel for circle
                updateDimensionPanel(dimensionPanel, width, height, 0)
            } else if (currentTool === 'line') {
                // Calculate line length and angle for any direction
                const length = Math.sqrt(width * width + height * height)
                angle = Math.atan2(height, width) * (180 / Math.PI)

                // Always position at start point
                tempDiv.style.left = `${x}px`
                tempDiv.style.top = `${y}px`
                tempDiv.style.width = `${length}px`
                tempDiv.style.height = '2px'
                tempDiv.style.transformOrigin = '0 0'
                tempDiv.style.transform = `rotate(${angle}deg)`
                styles.borderRadius = '0px'
                tempDiv.style.borderRadius = styles.borderRadius

                // Update dimension panel for line (show only length)
                updateDimensionPanel(dimensionPanel, length, 0, angle, true)
            }

            canvas.appendChild(tempDiv)
        }

        function applyBorders(id) {
            elements = elements.map((el) => {
                if (el.id === id) {
                    selectedItemId = el.id
                    // Remove isNewlyCreated flag when selecting
                    const { isNewlyCreated, ...rest } = el
                    return { ...rest, isSelected: true }
                } else {
                    const { isNewlyCreated, ...rest } = el
                    return { ...rest, isSelected: false }
                }
            })
            // Sync properties panel
            if (propertiesPanel) {
                propertiesPanel.onSelectionChange(id)
            }
        }

        function handleMouseUp() {
            canvas.removeEventListener('mousemove', handleMouseMove)

            // Remove tempDiv from DOM
            if (tempDiv.parentNode) {
                tempDiv.remove()
            }

            // For lines, check length; for shapes, check both width and height
            const isValidSize = type === 'line'
                ? Math.sqrt(width * width + height * height) > 6
                : (Math.abs(width) > 10 && Math.abs(height) > 10)

            if (isValidSize) {
                // For lines, store the angle and adjust styles
                if (type === 'line') {
                    const length = Math.sqrt(width * width + height * height)
                    styles.transform = `rotate(${angle}deg)`
                    styles.transformOrigin = '0 0'
                    elements.push({ id: currentId, type, x, y, width: length, height: 2, styles })
                } else {
                    elements.push({ id: currentId, type, x, y, width, height, styles })
                }
                mode = 'select'
                let currentToolEl = document.querySelector(`#${currentTool}`)
                currentToolEl.style.backgroundColor = 'transparent'
                selectTool.style.backgroundColor = '#0E81E6'
                currentTool = 'select'
                toolSelector(document.querySelector(`#${currentTool}`))
                applyBorders(currentId)
            }
            renderElements()
            canvas.removeEventListener('mouseup', handleMouseUp)
        }

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
    } else if (tab === 'create' && mode === 'select') {
        const target = e.target

        // Check if clicked on canvas (not an element)
        // Need to check if target or its parent has dataset.element (for text-content)
        const elementDiv = target.closest('[data-element]')
        
        if (!elementDiv || target === canvas) {
            console.log('Clicked on canvas, deselecting all')

            selectedItemId = null
            elements = elements.map((elem) => {
                const { isNewlyCreated, ...rest } = elem
                return { ...rest, isSelected: false }
            })
            renderElements()
            
            // Sync properties panel
            if (propertiesPanel) {
                propertiesPanel.onSelectionChange(null)
            }
            return
        }

        let startMouseX = e.clientX
        let startMouseY = e.clientY

        selectedItemId = Number(elementDiv.dataset.element)
        console.log('Selected element:', selectedItemId)

        const targetDetails = elements.find(el => el.id === selectedItemId)
        console.log(targetDetails)

        // Get actual rendered position from DOM (not from data)
        const startElementX = parseInt(elementDiv.style.left)
        const startElementY = parseInt(elementDiv.style.top)

        // Initialize with current position so clicking without dragging doesn't move element
        let newX = startElementX
        let newY = startElementY

        elements = elements.map((elem) => {
            if (elem.id === selectedItemId) {
                return { ...elem, isSelected: true }
            } else {
                return { ...elem, isSelected: false }
            }
        })

        renderElements()
        
        // Sync properties panel
        if (propertiesPanel) {
            propertiesPanel.onSelectionChange(selectedItemId)
        }

        function handleMouseMove(e) {
            newX = startElementX + (e.clientX - startMouseX)
            newY = startElementY + (e.clientY - startMouseY)

            // Get the fresh element reference after render
            const currentElement = canvas.querySelector(`[data-element="${selectedItemId}"]`)
            if (currentElement) {
                const canvasWidth = canvas.offsetWidth
                const canvasHeight = canvas.offsetHeight

                // For lines, keep origin point within canvas
                if (targetDetails.type === 'line') {
                    newX = Math.max(0, Math.min(newX, canvasWidth))
                    newY = Math.max(0, Math.min(newY, canvasHeight))
                } else {
                    // For shapes, use element dimensions for boundary checking
                    const elementWidth = currentElement.offsetWidth
                    const elementHeight = currentElement.offsetHeight
                    newX = Math.max(0, Math.min(newX, canvasWidth - elementWidth))
                    newY = Math.max(0, Math.min(newY, canvasHeight - elementHeight))
                }

                currentElement.style.left = `${newX}px`
                currentElement.style.top = `${newY}px`
            }
        }

        function handleMouseUp() {
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mouseup', handleMouseUp)
            elements = elements.map((el) => {
                if (el.id === selectedItemId) {
                    // For shapes with negative width/height, adjust x/y back
                    if (el.type !== 'line') {
                        const adjustedX = el.width < 0 ? newX - el.width : newX
                        const adjustedY = el.height < 0 ? newY - el.height : newY
                        return { ...el, x: adjustedX, y: adjustedY }
                    } else {
                        return { ...el, x: newX, y: newY }
                    }
                }
                return el
            })
            renderElements()
        }

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
    }
}

function renderElements() {
    canvas.querySelectorAll('[data-element]').forEach(el => el.remove())

    elements.forEach((el) => {
        const div = createElement(el)
        canvas.appendChild(div)
    })
}

function createElement(element) {
    const div = document.createElement('div')
    div.dataset.element = element.id
    applyStyles(div, element)

    // For text elements, add contenteditable div
    if (element.type === 'text') {
        const textContent = document.createElement('div')
        textContent.className = 'text-content'
        const isNewlyCreated = element.isNewlyCreated
        textContent.setAttribute('contenteditable', isNewlyCreated ? 'true' : 'false')
        textContent.textContent = element.text || 'Text'
        textContent.style.outline = 'none'
        textContent.style.fontSize = `${element.fontSize || 16}px`
        textContent.style.fontFamily = 'Arial, sans-serif'
        textContent.style.cursor = isNewlyCreated ? 'text' : 'move'
        textContent.style.padding = '4px'
        textContent.style.boxSizing = 'border-box'
        textContent.style.whiteSpace = 'pre-wrap'
        textContent.style.wordWrap = 'break-word'
        textContent.style.minWidth = '20px'
        textContent.style.minHeight = '20px'
        textContent.style.display = 'inline-block'
        textContent.style.userSelect = isNewlyCreated ? 'text' : 'none'
        
        // Update element text on input
        textContent.addEventListener('input', (e) => {
            const elementIndex = elements.findIndex(el => el.id === element.id)
            if (elementIndex !== -1) {
                elements[elementIndex].text = e.target.textContent
            }
        })
        
        // Save and exit edit mode on blur
        textContent.addEventListener('blur', (e) => {
            textContent.setAttribute('contenteditable', 'false')
            textContent.style.cursor = 'move'
            textContent.style.userSelect = 'none'
            
            // Update element text and remove isNewlyCreated flag
            const elementIndex = elements.findIndex(el => el.id === element.id)
            if (elementIndex !== -1) {
                elements[elementIndex].text = e.target.textContent
                delete elements[elementIndex].isNewlyCreated
            }
        })
        
        // Stop propagation when actively editing
        textContent.addEventListener('mousedown', (e) => {
            if (textContent.getAttribute('contenteditable') === 'true') {
                e.stopPropagation()
            }
        })
        
        // If element is newly created, focus and select text
        if (isNewlyCreated) {
            setTimeout(() => {
                textContent.focus()
                
                // Select all text
                const range = document.createRange()
                range.selectNodeContents(textContent)
                const selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            }, 0)
        }
        
        div.appendChild(textContent)
    }

    // Add dimension panel if element is selected
    if (element.isSelected) {
        const isLine = element.type === 'line'
        const isText = element.type === 'text'
        
        if (!isText) {
            const dimensionPanel = createDimensionPanel(element.width, element.height, element.rotation, isLine)
            div.appendChild(dimensionPanel)
        }
        
        // Add resize handles
        const resizeHandles = createResizeHandles(element)
        resizeHandles.forEach(handle => div.appendChild(handle))
        
        // Add rotation handle (not for lines or text)
        if (!isLine && !isText) {
            const rotationHandle = createRotationHandle(element)
            if (rotationHandle) {
                div.appendChild(rotationHandle)
            }
        }
    }

    return div
}

function applyStyles(item, stylingInfo) {
    item.type = stylingInfo.type
    item.style.position = 'absolute'
    item.style.borderStyle = 'solid'
    item.style.borderWidth = stylingInfo.styles.borderWidth
    item.style.borderColor = stylingInfo.styles.borderColor
    item.style.backgroundColor = stylingInfo.styles.backgroundColor
    item.style.borderRadius = stylingInfo.styles.borderRadius
    item.style.cursor = 'move'
    
    // Add selection outline (separate from border)
    if (stylingInfo.isSelected) {
        item.style.outline = '2px solid #0E81E6'
        item.style.outlineOffset = '0px'
    } else {
        item.style.outline = 'none'
    }

    // Handle text elements
    if (stylingInfo.type === 'text') {
        item.style.top = `${stylingInfo.y}px`
        item.style.left = `${stylingInfo.x}px`
        
        // Use auto sizing for text elements
        if (stylingInfo.width === 'auto' || !stylingInfo.width) {
            item.style.width = 'auto'
            item.style.maxWidth = '800px' // Prevent too wide
        } else {
            item.style.width = `${stylingInfo.width}px`
        }
        
        if (stylingInfo.height === 'auto' || !stylingInfo.height) {
            item.style.height = 'auto'
        } else {
            item.style.height = `${stylingInfo.height}px`
        }
        
        item.style.display = 'inline-block'
    }
    // Handle lines differently
    else if (stylingInfo.type === 'line') {
        item.style.top = `${stylingInfo.y}px`
        item.style.left = `${stylingInfo.x}px`
        item.style.width = `${stylingInfo.width}px`
        item.style.height = `${stylingInfo.height}px`
        item.style.transformOrigin = stylingInfo.styles.transformOrigin || '0 0'
        
        // Apply line-specific transform or rotation
        if (stylingInfo.rotation !== undefined) {
            item.style.transform = `rotate(${stylingInfo.rotation}deg)`
        } else if (stylingInfo.styles.transform) {
            item.style.transform = stylingInfo.styles.transform
        }
    } else {
        // Handle squares and circles
        if (stylingInfo.width > 0) {
            item.style.left = `${stylingInfo.x}px`
        } else {
            item.style.left = `${stylingInfo.x + stylingInfo.width}px`
        }

        if (stylingInfo.height > 0) {
            item.style.top = `${stylingInfo.y}px`
        } else {
            item.style.top = `${stylingInfo.y + stylingInfo.height}px`
        }

        item.style.width = `${Math.abs(stylingInfo.width)}px`
        item.style.height = `${Math.abs(stylingInfo.height)}px`
        
        // Apply rotation for shapes
        if (stylingInfo.rotation !== undefined) {
            item.style.transform = `rotate(${stylingInfo.rotation}deg)`
            item.style.transformOrigin = 'center center'
        }
    }
}

// Initialize tab indicator position
function initTabIndicator() {
    const activeTab = document.querySelector('.active-tab')
    const indicator = document.querySelector('#tab-indicator')
    const tabRect = activeTab.getBoundingClientRect()
    const containerRect = activeTab.parentElement.getBoundingClientRect()

    indicator.style.left = `${tabRect.left - containerRect.left}px`
    indicator.style.width = `${tabRect.width}px`
}

// Initialize on page load
initTabIndicator()

tabs.forEach((tabEl) => {
    tabEl.addEventListener('click', e => {
        const el = e.target
        tab = el.id
        if(tab === 'export') canvas.style.cursor = 'default'
        else canvas.style.cursor = 'crosshair'
        switchTab(el)
    })
})