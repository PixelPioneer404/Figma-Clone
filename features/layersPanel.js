export class LayersPanel {
    constructor(getElements, setElements, renderCallback, onLayerSelect, onLayerDelete) {
        this.getElements = getElements
        this.setElements = setElements
        this.renderCallback = renderCallback
        this.onLayerSelect = onLayerSelect
        this.onLayerDelete = onLayerDelete
        this.isVisible = false
        this.selectedLayerId = null
        
        this.panel = document.getElementById('layers-panel')
        this.toggleBtn = document.getElementById('layers-toggle-btn')
        this.closeBtn = document.getElementById('layers-close-btn')
        this.deleteAllBtn = document.getElementById('delete-all-layers-btn')
        this.layersList = document.getElementById('layers-list')
        
        this.confirmModal = document.getElementById('delete-all-confirmation-modal')
        this.confirmText = document.getElementById('delete-all-confirmation-text')
        this.confirmBtn = document.getElementById('delete-all-confirm-btn')
        this.cancelBtn = document.getElementById('delete-all-cancel-btn')
        
        this.init()
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
        
        this.deleteAllBtn.addEventListener('click', () => {
            this.showDeleteConfirmation()
        })
        
        this.cancelBtn.addEventListener('click', () => {
            this.hideDeleteConfirmation()
        })
        
        this.confirmBtn.addEventListener('click', () => {
            this.executeDeleteAll()
        })
        
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.hideDeleteConfirmation()
            }
        })
        
        this.updateLayersList()
    }
    
    show() {
        this.isVisible = true
        this.panel.classList.remove('-translate-x-[calc(100%+40px)]')
        this.panel.classList.add('translate-x-0')
        const icon = this.toggleBtn.querySelector('img')
        icon.src = '/assets/icons/layers-fill.png'
    }
    
    hide() {
        this.isVisible = false
        this.panel.classList.add('-translate-x-[calc(100%+40px)]')
        this.panel.classList.remove('translate-x-0')
        const icon = this.toggleBtn.querySelector('img')
        icon.src = '/assets/icons/layers.png'
    }
    
    updateLayersList() {
        const elements = this.getElements()
        
        this.layersList.innerHTML = ''
        
        if (elements.length === 0) {
            this.deleteAllBtn.disabled = true
            this.layersList.innerHTML = `
                <div class="text-white/40 text-sm font-sans text-center py-8">
                    No layers yet
                </div>
            `
            return
        }
        
        this.deleteAllBtn.disabled = false
        
        const reversedElements = [...elements].reverse()
        
        reversedElements.forEach((element, visualIndex) => {
            const layerItem = this.createLayerItem(element, visualIndex, reversedElements.length)
            this.layersList.appendChild(layerItem)
        })
    }
    
    createLayerItem(element, visualIndex, totalLayers) {
        const layerDiv = document.createElement('div')
        layerDiv.dataset.layerId = element.id
        layerDiv.className = `layer-item flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group ${
            element.isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'border border-transparent'
        }`
        
        const icon = this.getElementIcon(element.type)
        
        const name = this.getElementName(element)
        
        const isAtTop = visualIndex === 0
        const isAtBottom = visualIndex === totalLayers - 1
        
        layerDiv.innerHTML = `
            <div class="flex items-center gap-2 flex-1 min-w-0" data-layer-select="${element.id}">
                <i class="${icon} text-white/80 text-base shrink-0"></i>
                <span class="text-white/90 text-sm font-sans truncate">${name}</span>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="layer-move-up text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-all" 
                        data-layer-id="${element.id}" 
                        ${isAtTop ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                    <i class="ri-arrow-up-line text-sm"></i>
                </button>
                <button class="layer-move-down text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-all" 
                        data-layer-id="${element.id}"
                        ${isAtBottom ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                    <i class="ri-arrow-down-line text-sm"></i>
                </button>
                <button class="layer-delete text-white/60 hover:text-red-500 hover:bg-white/10 rounded p-1 transition-all" data-layer-id="${element.id}">
                    <i class="ri-delete-bin-line text-sm"></i>
                </button>
            </div>
        `
        
        const selectArea = layerDiv.querySelector('[data-layer-select]')
        selectArea.addEventListener('click', (e) => {
            e.stopPropagation()
            this.selectLayer(element.id)
        })
        
        const moveUpBtn = layerDiv.querySelector('.layer-move-up')
        if (moveUpBtn && !moveUpBtn.disabled) {
            moveUpBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.moveLayerUp(element.id)
            })
        }
        
        const moveDownBtn = layerDiv.querySelector('.layer-move-down')
        if (moveDownBtn && !moveDownBtn.disabled) {
            moveDownBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.moveLayerDown(element.id)
            })
        }
        
        const deleteBtn = layerDiv.querySelector('.layer-delete')
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.deleteLayer(element.id)
        })
        
        return layerDiv
    }
    
    getElementIcon(type) {
        const icons = {
            'square': 'ri-square-line',
            'circle': 'ri-circle-line',
            'line': 'ri-subtract-line',
            'text': 'ri-text'
        }
        return icons[type] || 'ri-shape-line'
    }
    
    getElementName(element) {
        if (element.type === 'text') {
            const text = element.text || 'Text'
            return text.length > 15 ? text.substring(0, 15) + '...' : text
        }
        return element.type.charAt(0).toUpperCase() + element.type.slice(1)
    }
    
    selectLayer(layerId) {
        this.selectedLayerId = layerId
        
        if (this.onLayerSelect) {
            this.onLayerSelect(layerId)
        }
        
        this.updateLayersList()
    }
    
    moveLayerUp(layerId) {
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === layerId)
        
        if (index < elements.length - 1) {
            const temp = elements[index]
            elements[index] = elements[index + 1]
            elements[index + 1] = temp
            
            this.setElements(elements)
            this.renderCallback()
            this.updateLayersList()
        }
    }
    
    moveLayerDown(layerId) {
        const elements = this.getElements()
        const index = elements.findIndex(el => el.id === layerId)
        
        if (index > 0) {
            const temp = elements[index]
            elements[index] = elements[index - 1]
            elements[index - 1] = temp
            
            this.setElements(elements)
            this.renderCallback()
            this.updateLayersList()
        }
    }
    
    deleteLayer(layerId) {
        if (this.onLayerDelete) {
            this.onLayerDelete(layerId)
        }
        
        this.updateLayersList()
    }
    
    deleteAllLayers() {
        const elements = this.getElements()
        
        if (elements.length === 0) {
            return
        }
        
        if (confirm(`Are you sure you want to delete all ${elements.length} layer${elements.length > 1 ? 's' : ''}?`)) {
            this.setElements([])
            this.selectedLayerId = null
            
            const canvas = document.getElementById('canvas')
            canvas.innerHTML = ''
            
            this.renderCallback()
            this.updateLayersList()
            
            if (this.onLayerSelect) {
                this.onLayerSelect(null)
            }
        }
    }
    
    onSelectionChange(selectedId) {
        this.selectedLayerId = selectedId
        this.updateLayersList()
    }
}
