
export function createResizeHandles(element) {
    const handleSize = '10px'
    const handles = []
    
    const positionConfigs = {
        square: [
            { cursor: 'nw-resize', top: '-5px', left: '-5px', corner: 'tl' },
            { cursor: 'ne-resize', top: '-5px', right: '-5px', corner: 'tr' },
            { cursor: 'sw-resize', bottom: '-5px', left: '-5px', corner: 'bl' },
            { cursor: 'se-resize', bottom: '-5px', right: '-5px', corner: 'br' }
        ],
        circle: [
            { cursor: 'n-resize', top: '-5px', left: '50%', transform: 'translateX(-50%)', corner: 't' },
            { cursor: 's-resize', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', corner: 'b' },
            { cursor: 'w-resize', top: '50%', left: '-5px', transform: 'translateY(-50%)', corner: 'l' },
            { cursor: 'e-resize', top: '50%', right: '-5px', transform: 'translateY(-50%)', corner: 'r' }
        ],
        line: [
            { cursor: 'grab', corner: 'start' },
            { cursor: 'grab', corner: 'end' }
        ],
        text: [
            { cursor: 'nw-resize', top: '-5px', left: '-5px', corner: 'tl' },
            { cursor: 'se-resize', bottom: '-5px', right: '-5px', corner: 'br' }
        ]
    }
    
    const positions = positionConfigs[element.type] || positionConfigs.square
    
    positions.forEach(pos => {
        const handle = document.createElement('div')
        handle.className = 'resize-handle'
        handle.dataset.corner = pos.corner
        handle.dataset.elementId = element.id
        
        Object.assign(handle.style, {
            position: 'absolute',
            width: handleSize,
            height: handleSize,
            backgroundColor: 'white',
            border: '2px solid #0E81E6',
            borderRadius: element.type === 'circle' ? '50%' : '2px',
            cursor: pos.cursor,
            zIndex: '10001',
            pointerEvents: 'auto'
        })
        
        if (element.type === 'line') {
            if (pos.corner === 'start') {
                handle.style.top = '-5px'
                handle.style.left = '-5px'
            } else if (pos.corner === 'end') {
                handle.style.left = `${element.width - 5}px`
                handle.style.top = '-5px'
            }
        } else {
            for (const [key, value] of Object.entries(pos)) {
                if (key !== 'cursor' && key !== 'corner') {
                    handle.style[key] = value
                }
            }
        }
        
        handles.push(handle)
    })
    
    return handles
}

export function createRotationHandle(element) {
    if (element.type === 'line') {
        return null
    }
    
    const handle = document.createElement('div')
    handle.className = 'rotation-handle'
    handle.dataset.elementId = element.id
    
    Object.assign(handle.style, {
        position: 'absolute',
        top: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '14px',
        height: '14px',
        backgroundColor: 'white',
        border: '2px solid #0E81E6',
        borderRadius: '50%',
        cursor: 'grab',
        zIndex: '10001',
        pointerEvents: 'auto'
    })
    
    return handle
}

export function handleResize(e, handleEl, elements, renderCallback, syncCallback) {
    e.stopPropagation()
    
    const corner = handleEl.dataset.corner
    const elementId = Number(handleEl.dataset.elementId)
    const element = elements.find(el => el.id === elementId)
    
    if (!element) return
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = element.width
    const startHeight = element.height
    const startPosX = element.x
    const startPosY = element.y
    const rotation = element.rotation || 0
    const rotationRad = rotation * (Math.PI / 180)
    
    let textAnchorX, textAnchorY, initialTextWidth, initialTextHeight
    if (element.type === 'text') {
        const textDiv = document.querySelector(`[data-element="${elementId}"]`)
        const textContent = textDiv ? textDiv.querySelector('.text-content') : null
        const actualRect = textContent ? textContent.getBoundingClientRect() : null
        initialTextWidth = actualRect ? actualRect.width : 100
        initialTextHeight = actualRect ? actualRect.height : 30
        
        if (corner === 'tl') {
            textAnchorX = startPosX + initialTextWidth
            textAnchorY = startPosY + initialTextHeight
        } else if (corner === 'br') {
            textAnchorX = startPosX
            textAnchorY = startPosY
        }
    }
    
    handleEl.style.cursor = 'grabbing'
    
    function onMouseMove(e) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        
        let newWidth = startWidth
        let newHeight = startHeight
        let newX = startPosX
        let newY = startPosY
        
        if (element.type === 'square') {
            if (rotation !== 0) {
                const centerX = startPosX + startWidth / 2
                const centerY = startPosY + startHeight / 2
                
                let oppositeCornerLocalX = 0
                let oppositeCornerLocalY = 0
                
                if (corner === 'br') {
                    oppositeCornerLocalX = -startWidth / 2
                    oppositeCornerLocalY = -startHeight / 2
                } else if (corner === 'bl') {
                    oppositeCornerLocalX = startWidth / 2
                    oppositeCornerLocalY = -startHeight / 2
                } else if (corner === 'tr') {
                    oppositeCornerLocalX = -startWidth / 2
                    oppositeCornerLocalY = startHeight / 2
                } else if (corner === 'tl') {
                    oppositeCornerLocalX = startWidth / 2
                    oppositeCornerLocalY = startHeight / 2
                }
                
                const oppositeCornerWorldX = centerX + oppositeCornerLocalX * Math.cos(rotationRad) - oppositeCornerLocalY * Math.sin(rotationRad)
                const oppositeCornerWorldY = centerY + oppositeCornerLocalX * Math.sin(rotationRad) + oppositeCornerLocalY * Math.cos(rotationRad)
                
                let dragCornerLocalX = 0
                let dragCornerLocalY = 0
                
                if (corner === 'br') {
                    dragCornerLocalX = startWidth / 2
                    dragCornerLocalY = startHeight / 2
                } else if (corner === 'bl') {
                    dragCornerLocalX = -startWidth / 2
                    dragCornerLocalY = startHeight / 2
                } else if (corner === 'tr') {
                    dragCornerLocalX = startWidth / 2
                    dragCornerLocalY = -startHeight / 2
                } else if (corner === 'tl') {
                    dragCornerLocalX = -startWidth / 2
                    dragCornerLocalY = -startHeight / 2
                }
                
                const dragCornerStartWorldX = centerX + dragCornerLocalX * Math.cos(rotationRad) - dragCornerLocalY * Math.sin(rotationRad)
                const dragCornerStartWorldY = centerY + dragCornerLocalX * Math.sin(rotationRad) + dragCornerLocalY * Math.cos(rotationRad)
                
                const dragCornerNewWorldX = dragCornerStartWorldX + dx
                const dragCornerNewWorldY = dragCornerStartWorldY + dy
                
                const newVectorX = dragCornerNewWorldX - oppositeCornerWorldX
                const newVectorY = dragCornerNewWorldY - oppositeCornerWorldY
                
                const localVectorX = newVectorX * Math.cos(-rotationRad) - newVectorY * Math.sin(-rotationRad)
                const localVectorY = newVectorX * Math.sin(-rotationRad) + newVectorY * Math.cos(-rotationRad)
                
                newWidth = Math.abs(localVectorX)
                newHeight = Math.abs(localVectorY)
                
                newWidth = Math.max(20, newWidth)
                newHeight = Math.max(20, newHeight)
                
                const newCenterX = oppositeCornerWorldX + newVectorX / 2
                const newCenterY = oppositeCornerWorldY + newVectorY / 2
                
                newX = newCenterX - newWidth / 2
                newY = newCenterY - newHeight / 2
                
            } else {
                if (corner === 'br') { // bottom-right
                    newWidth = startWidth + dx
                    newHeight = startHeight + dy
                    
                    if (newWidth < 0) {
                        newX = startPosX + newWidth
                        newWidth = Math.abs(newWidth)
                    } else {
                        newX = startPosX
                    }
                    
                    if (newHeight < 0) {
                        newY = startPosY + newHeight
                        newHeight = Math.abs(newHeight)
                    } else {
                        newY = startPosY
                    }
                    
                } else if (corner === 'bl') { // bottom-left
                    newWidth = startWidth - dx
                    newHeight = startHeight + dy
                    
                    if (newWidth < 0) {
                        newX = startPosX + startWidth
                        newWidth = Math.abs(newWidth)
                    } else {
                        newX = startPosX + dx
                    }
                    
                    if (newHeight < 0) {
                        newY = startPosY + newHeight
                        newHeight = Math.abs(newHeight)
                    } else {
                        newY = startPosY
                    }
                    
                } else if (corner === 'tr') { // top-right
                    newWidth = startWidth + dx
                    newHeight = startHeight - dy
                    
                    if (newWidth < 0) {
                        newX = startPosX + newWidth
                        newWidth = Math.abs(newWidth)
                    } else {
                        newX = startPosX
                    }
                    
                    if (newHeight < 0) {
                        newY = startPosY + startHeight
                        newHeight = Math.abs(newHeight)
                    } else {
                        newY = startPosY + dy
                    }
                    
                } else if (corner === 'tl') { // top-left
                    newWidth = startWidth - dx
                    newHeight = startHeight - dy
                    
                    if (newWidth < 0) {
                        newX = startPosX + startWidth
                        newWidth = Math.abs(newWidth)
                    } else {
                        newX = startPosX + dx
                    }
                    
                    if (newHeight < 0) {
                        newY = startPosY + startHeight
                        newHeight = Math.abs(newHeight)
                    } else {
                        newY = startPosY + dy
                    }
                }
                
                newWidth = Math.max(20, newWidth)
                newHeight = Math.max(20, newHeight)
            }
            
        } else if (element.type === 'circle') {
            if (corner === 't') { // top
                newHeight = Math.max(20, startHeight - dy)
                newY = startPosY + dy
            } else if (corner === 'b') { // bottom
                newHeight = Math.max(20, startHeight + dy)
            } else if (corner === 'l') { // left
                newWidth = Math.max(20, startWidth - dx)
                newX = startPosX + dx
            } else if (corner === 'r') { // right
                newWidth = Math.max(20, startWidth + dx)
            }
            
        } else if (element.type === 'line') {
            
            if (corner === 'start') {
                const currentElement = elements.find(el => el.id === elementId)
                if (!currentElement) return
                
                const currentTransform = currentElement.styles.transform || 'rotate(0deg)'
                const currentAngleMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
                const currentAngle = currentAngleMatch ? parseFloat(currentAngleMatch[1]) : 0
                const currentAngleRad = currentAngle * (Math.PI / 180)
                
                const currentEndX = currentElement.x + currentElement.width * Math.cos(currentAngleRad)
                const currentEndY = currentElement.y + currentElement.width * Math.sin(currentAngleRad)
                
                newX = startPosX + dx
                newY = startPosY + dy
                
                const deltaX = currentEndX - newX
                const deltaY = currentEndY - newY
                const newLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
                
                newWidth = Math.max(10, newLength)
                
                const index = elements.findIndex(el => el.id === elementId)
                if (index !== -1) {
                    elements[index] = {
                        ...elements[index],
                        width: newWidth,
                        x: newX,
                        y: newY,
                        styles: {
                            ...elements[index].styles,
                            transform: `rotate(${newAngle}deg)`
                        }
                    }
                }
                renderCallback()
                if (syncCallback) syncCallback()
                return
                
            } else if (corner === 'end') {
                const newEndX = e.clientX
                const newEndY = e.clientY
                
                const deltaX = newEndX - startPosX
                const deltaY = newEndY - startPosY
                const newLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
                
                newWidth = Math.max(10, newLength)
                
                const index = elements.findIndex(el => el.id === elementId)
                if (index !== -1) {
                    elements[index] = {
                        ...elements[index],
                        width: newWidth,
                        styles: {
                            ...elements[index].styles,
                            transform: `rotate(${newAngle}deg)`
                        }
                    }
                }
                renderCallback()
                if (syncCallback) syncCallback()
                return
            }
        } else if (element.type === 'text') {
            if (corner === 'tl') {
                const currentDist = Math.sqrt(
                    Math.pow(e.clientX - textAnchorX, 2) + Math.pow(e.clientY - textAnchorY, 2)
                )
                const startDist = Math.sqrt(
                    Math.pow(startPosX - textAnchorX, 2) + Math.pow(startPosY - textAnchorY, 2)
                )
                
                const distChange = currentDist - startDist
                const fontSizeChange = distChange / 5
                const startFontSize = element.fontSize || 16
                let newFontSize = startFontSize + fontSizeChange
                newFontSize = Math.max(8, Math.min(200, newFontSize))
                
                const fontScale = newFontSize / startFontSize
                const scaledWidth = initialTextWidth * fontScale
                const scaledHeight = initialTextHeight * fontScale
                
                newX = textAnchorX - scaledWidth
                newY = textAnchorY - scaledHeight
                
                const index = elements.findIndex(el => el.id === elementId)
                if (index !== -1) {
                    elements[index] = {
                        ...elements[index],
                        fontSize: newFontSize,
                        x: newX,
                        y: newY
                    }
                }
            } else if (corner === 'br') {
                const currentDist = Math.sqrt(
                    Math.pow(e.clientX - textAnchorX, 2) + Math.pow(e.clientY - textAnchorY, 2)
                )
                const startDist = Math.sqrt(
                    Math.pow((startPosX + initialTextWidth) - textAnchorX, 2) + 
                    Math.pow((startPosY + initialTextHeight) - textAnchorY, 2)
                )
                
                const distChange = currentDist - startDist
                const fontSizeChange = distChange / 5
                const startFontSize = element.fontSize || 16
                let newFontSize = startFontSize + fontSizeChange
                newFontSize = Math.max(8, Math.min(200, newFontSize))
                
                const index = elements.findIndex(el => el.id === elementId)
                if (index !== -1) {
                    elements[index] = {
                        ...elements[index],
                        fontSize: newFontSize
                    }
                }
            }
            
            renderCallback()
            if (syncCallback) syncCallback()
            return
        }
        
        const index = elements.findIndex(el => el.id === elementId)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY
            }
        }
        
        renderCallback()
        if (syncCallback) syncCallback()
    }
    
    function onMouseUp() {
        handleEl.style.cursor = corner.includes('resize') ? handleEl.style.cursor.replace('grabbing', '') : 'grab'
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

export function handleRotation(e, rotationHandle, elements, renderCallback, syncCallback) {
    e.stopPropagation()
    
    const elementId = Number(rotationHandle.dataset.elementId)
    const element = elements.find(el => el.id === elementId)
    
    if (!element) return
    
    const elementDiv = rotationHandle.parentElement
    const rect = elementDiv.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    rotationHandle.style.cursor = 'grabbing'
    
    const currentRotation = element.rotation || 0
    
    function onMouseMove(e) {
        const angle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        ) * (180 / Math.PI)
        
        const normalizedAngle = angle + 90
        
        const index = elements.findIndex(el => el.id === elementId)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                rotation: normalizedAngle
            }
        }
        
        renderCallback()
        if (syncCallback) syncCallback()
    }
    
    function onMouseUp() {
        rotationHandle.style.cursor = 'grab'
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}
