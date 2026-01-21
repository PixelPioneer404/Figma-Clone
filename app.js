let elements = []
let id = 0
let mode = 'select'
let currentTool = null
let selectedItemId = null

const canvas = document.querySelector('#canvas')
const selectTool = document.querySelector('#select');
const squareTool = document.querySelector('#square');
const circleTool = document.querySelector('#circle');
const lineTool = document.querySelector('#line');
const textTool = document.querySelector('#text');

selectTool.addEventListener('click', () => {
    mode = 'select'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
squareTool.addEventListener('click', () => {
    mode = 'draw'
    currentTool = 'square'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
circleTool.addEventListener('click', () => {
    mode = 'draw'
    currentTool = 'circle'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
lineTool.addEventListener('click', () => {
    mode = 'draw'
    currentTool = 'line'
    console.log('Mode:', mode, '| Tool:', currentTool)
})
textTool.addEventListener('click', () => {
    mode = 'draw'
    currentTool = 'text'
    console.log('Mode:', mode, '| Tool:', currentTool)
})

canvas.addEventListener('mousedown', handleMouseDown)
function handleMouseDown(e) {
    if (mode === 'draw') {
        canvas.style.cursor = 'crosshair' //for any draw tool

        let type = currentTool
        let x = e.clientX
        let y = e.clientY
        let width = 0
        let height = 0
        let styles = {
            borderWidth: '2px',
            borderColor: 'transparent',
            backgroundColor: '#FF0000',
            borderRadius: '0px'
        }

        // For lines, we'll store rotation angle
        let angle = 0

        id = id + 1
        let currentId = id

        const tempDiv = document.createElement('div')

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
            } else if (currentTool === 'circle') {
                if (width > 0) tempDiv.style.left = `${x}px`
                else tempDiv.style.left = `${x + width}px`
                if (height > 0) tempDiv.style.top = `${y}px`
                else tempDiv.style.top = `${y + height}px`
                tempDiv.style.width = `${Math.abs(width)}px`
                tempDiv.style.height = `${Math.abs(height)}px`
                styles.borderRadius = '100%'
                tempDiv.style.borderRadius = styles.borderRadius
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
            }

            canvas.appendChild(tempDiv)
        }

        function applyBorders(id) {
            elements = elements.map((el) => {
                if (el.id === id) {
                    selectedItemId = el.id
                    return { ...el, styles: { ...el.styles, borderColor: '#0000FF' } }
                } else {
                    return { ...el, styles: { ...el.styles, borderColor: 'transparent' } }
                }
            })
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
                applyBorders(currentId)
            }
            renderElements()
            canvas.removeEventListener('mouseup', handleMouseUp)
        }

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
    } else {
        const target = e.target

        // Check if clicked on canvas (not an element)
        if (!target.dataset.element || target === canvas) {
            console.log('Clicked on canvas, deselecting all')
            selectedItemId = null
            elements = elements.map((elem) => {
                return { ...elem, styles: { ...elem.styles, borderColor: 'transparent' } }
            })
            renderElements()
            return
        }

        let startMouseX = e.clientX
        let startMouseY = e.clientY

        selectedItemId = Number(target.dataset.element)
        console.log('Selected element:', selectedItemId)

        const targetDetails = elements.find(el => el.id === selectedItemId)
        console.log(targetDetails)

        // Get actual rendered position from DOM (not from data)
        const startElementX = parseInt(target.style.left)
        const startElementY = parseInt(target.style.top)

        // Initialize with current position so clicking without dragging doesn't move element
        let newX = startElementX
        let newY = startElementY

        elements = elements.map((elem) => {
            if (elem.id === selectedItemId) {
                return { ...elem, styles: { ...elem.styles, borderColor: '#0000FF' } }
            } else {
                return { ...elem, styles: { ...elem.styles, borderColor: 'transparent' } }
            }
        })

        renderElements()

        function handleMouseMove(e) {
            newX = startElementX + (e.clientX - startMouseX)
            newY = startElementY + (e.clientY - startMouseY)

            // Get the fresh element reference after render
            const currentElement = canvas.querySelector(`[data-element="${selectedItemId}"]`)
            if (currentElement) {
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
    return div
}

function applyStyles(item, stylingInfo) {
    item.type = stylingInfo.type
    item.style.position = 'absolute'
    item.style.borderWidth = stylingInfo.styles.borderWidth
    item.style.borderColor = stylingInfo.styles.borderColor
    item.style.backgroundColor = stylingInfo.styles.backgroundColor
    item.style.borderRadius = stylingInfo.styles.borderRadius

    // Handle lines differently
    if (stylingInfo.type === 'line') {
        item.style.top = `${stylingInfo.y}px`
        item.style.left = `${stylingInfo.x}px`
        item.style.width = `${stylingInfo.width}px`
        item.style.height = `${stylingInfo.height}px`
        item.style.transformOrigin = stylingInfo.styles.transformOrigin || '0 0'
        item.style.transform = stylingInfo.styles.transform || 'none'
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
    }
}