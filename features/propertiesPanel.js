import { deleteElement } from './deleteElement.js'

export class PropertiesPanel {
    constructor(getElements, setElements, renderCallback, onDelete) {
        this.getElements = getElements
        this.setElements = setElements
        this.renderCallback = renderCallback
        this.onDelete = onDelete
        this.selectedElement = null
        this.isVisible = false
        this.isUpdatingFromCanvas = false
        
        this.panel = document.getElementById('properties-panel')
        this.toggleBtn = document.getElementById('panel-toggle-btn')
        this.closeBtn = document.getElementById('panel-close-btn')
        this.panelContent = document.getElementById('panel-content')
        this.deleteBtn = document.getElementById('delete-element-btn')
        
        this.inputs = {
            width: document.getElementById('prop-width'),
            height: document.getElementById('prop-height'),
            rotation: document.getElementById('prop-rotation'),
            borderRadius: document.getElementById('prop-border-radius'),
            bgColor: document.getElementById('prop-bg-color'),
            strokeColor: document.getElementById('prop-stroke-color'),
            strokeWidth: document.getElementById('prop-stroke-width'),
            textContent: document.getElementById('prop-text-content'),
            fontSize: document.getElementById('prop-font-size')
        }
        
        this.borderRadiusGroup = document.getElementById('prop-border-radius-group')
        this.textGroup = document.getElementById('prop-text-group')
        
        this.init()
        
        this.disable()
    }
    
    init() {
        this.toggleBtn.addEventListener('click', () => {
            if (this.isVisible) {
                this.hide()
            } else {
                this.show()
            }
        })
        
        this.closeBtn.addEventListener('click', () => {
            this.hide()
        })
        
        this.deleteBtn.addEventListener('click', () => {
            this.deleteSelectedElement()
        })
        
        this.inputs.width.addEventListener('input', (e) => this.updateElementProperty('width', parseFloat(e.target.value)))
        this.inputs.height.addEventListener('input', (e) => this.updateElementProperty('height', parseFloat(e.target.value)))
        this.inputs.rotation.addEventListener('input', (e) => this.updateElementProperty('rotation', parseFloat(e.target.value)))
        this.inputs.borderRadius.addEventListener('input', (e) => this.updateElementBorderRadius(e.target.value))
        this.inputs.bgColor.addEventListener('input', (e) => this.updateElementBgColor(e.target.value))
        this.inputs.strokeColor.addEventListener('input', (e) => this.updateElementStrokeColor(e.target.value))
        this.inputs.strokeWidth.addEventListener('input', (e) => this.updateElementStrokeWidth(parseFloat(e.target.value)))
        this.inputs.textContent.addEventListener('input', (e) => this.updateElementText(e.target.value))
        this.inputs.fontSize.addEventListener('input', (e) => this.updateElementFontSize(parseFloat(e.target.value)))
    }
    
    show() {
        this.isVisible = true
        this.panel.classList.remove('translate-x-[calc(100%+40px)]')
        this.panel.classList.add('translate-x-0')
        const icon = this.toggleBtn.querySelector('img')
        icon.src = './assets/icons/theme-fill.png'
        
        if (!this.selectedElement) {
            this.disable()
        }
    }
    
    hide() {
        this.isVisible = false
        this.panel.classList.add('translate-x-[calc(100%+40px)]')
        this.panel.classList.remove('translate-x-0')
        const icon = this.toggleBtn.querySelector('img')
        icon.src = './assets/icons/theme.png'
    }
    
    onSelectionChange(selectedId, forceUpdate = false, autoOpen = false) {
        if (selectedId === null) {
            this.selectedElement = null
            this.disable()
            return
        }
        
        const elements = this.getElements()
        const element = elements.find(el => el.id === selectedId)
        if (element) {
            this.selectedElement = element
            
            if (!this.isVisible && autoOpen) {
                this.show()
            }
            
            this.enable()
            if (forceUpdate || !this.selectedElement || this.selectedElement.id !== selectedId) {
                this.updatePanelValues()
            } else {
                this.updatePanelValues()
            }
        }
    }
    
    updatePanelValues() {
        if (!this.selectedElement) return
        
        const elements = this.getElements()
        const el = elements.find(e => e.id === this.selectedElement.id)
        if (!el) return
        
        this.isUpdatingFromCanvas = true
        
        this.inputs.rotation.value = Math.round(el.rotation || 0)
        this.inputs.bgColor.value = this.rgbToHex(el.styles.backgroundColor) || '#ffffff'
        this.inputs.strokeColor.value = el.styles.borderColor || '#000000'
        this.inputs.strokeWidth.value = Math.round(parseInt(el.styles.borderWidth) || 0)
        
        if (el.type === 'text') {
            this.inputs.width.parentElement.parentElement.style.display = 'none'
            this.inputs.height.parentElement.parentElement.style.display = 'none'
            this.borderRadiusGroup.classList.add('hidden')
            this.textGroup.classList.remove('hidden')
            
            this.inputs.textContent.value = el.text || 'Text'
            this.inputs.fontSize.value = Math.round(el.fontSize || 16)
        } else {
            this.inputs.width.parentElement.parentElement.style.display = 'flex'
            this.inputs.height.parentElement.parentElement.style.display = 'flex'
            this.inputs.width.value = Math.round(Math.abs(el.width) || 0)
            this.inputs.height.value = Math.round(Math.abs(el.height) || 0)
            this.textGroup.classList.add('hidden')
            
            if (el.type === 'square') {
                this.borderRadiusGroup.classList.remove('hidden')
                this.inputs.borderRadius.value = Math.round(parseInt(el.styles.borderRadius) || 0)
            } else {
                this.borderRadiusGroup.classList.add('hidden')
            }
        }
        
        this.isUpdatingFromCanvas = false
    }
    
    enable() {
        this.panelContent.classList.remove('opacity-50', 'pointer-events-none')
        this.deleteBtn.disabled = false
        Object.values(this.inputs).forEach(input => {
            input.disabled = false
        })
    }
    
    disable() {
        this.panelContent.classList.add('opacity-50', 'pointer-events-none')
        this.deleteBtn.disabled = true
        Object.values(this.inputs).forEach(input => {
            input.disabled = true
        })
        this.clearPanelValues()
    }
    
    clearPanelValues() {
        this.inputs.width.value = ''
        this.inputs.height.value = ''
        this.inputs.rotation.value = ''
        this.inputs.borderRadius.value = ''
        this.inputs.bgColor.value = '#ffffff'
        this.inputs.strokeColor.value = '#000000'
        this.inputs.strokeWidth.value = ''
        this.inputs.textContent.value = ''
        this.inputs.fontSize.value = ''
    }
    
    updateElementProperty(prop, value) {
        if (!this.selectedElement || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                [prop]: value
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementBorderRadius(value) {
        if (!this.selectedElement || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                styles: {
                    ...elements[index].styles,
                    borderRadius: `${value}px`
                }
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementBgColor(value) {
        if (!this.selectedElement || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                styles: {
                    ...elements[index].styles,
                    backgroundColor: value
                }
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementStrokeColor(value) {
        if (!this.selectedElement || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                styles: {
                    ...elements[index].styles,
                    borderColor: value
                }
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementStrokeWidth(value) {
        if (!this.selectedElement || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                styles: {
                    ...elements[index].styles,
                    borderWidth: `${value}px`
                }
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementText(value) {
        if (!this.selectedElement || this.selectedElement.type !== 'text' || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                text: value
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    updateElementFontSize(value) {
        if (!this.selectedElement || this.selectedElement.type !== 'text' || this.isUpdatingFromCanvas) return
        
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === this.selectedElement.id)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                fontSize: value
            }
            this.selectedElement = elements[index]
            this.setElements(elements)
            this.renderCallback()
        }
    }
    
    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#ffffff'
        
        if (rgb.startsWith('#')) return rgb
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (!match) return '#ffffff'
        
        const r = parseInt(match[1])
        const g = parseInt(match[2])
        const b = parseInt(match[3])
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('')
    }
    
    deleteSelectedElement() {
        if (!this.selectedElement) return
        
        const elements = this.getElements()
        const updatedElements = deleteElement(this.selectedElement.id, elements)
        this.setElements(updatedElements)
        
        if (this.onDelete) {
            this.onDelete()
        }
        
        this.selectedElement = null
        
        this.renderCallback()
        
        this.onSelectionChange(null)
    }
}
