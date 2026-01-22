// Resize and Rotation Handles

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
        
        // Apply position styles
        if (element.type === 'line') {
            // For lines, handles should be positioned at endpoints
            // The line has transform applied, so we position handles in the untransformed space
            if (pos.corner === 'start') {
                handle.style.top = '-5px'
                handle.style.left = '-5px'
            } else if (pos.corner === 'end') {
                // End handle is at the end of the horizontal line (before rotation)
                // The parent line element has the rotation, so handle is positioned at (width, 0)
                handle.style.left = `${element.width - 5}px`
                handle.style.top = '-5px'
            }
        } else {
            // Apply position styles for non-line elements
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
    // Don't create rotation handle for lines
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

export function handleResize(e, handleEl, elements, renderCallback) {
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
    
    handleEl.style.cursor = 'grabbing'
    
    function onMouseMove(e) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        
        let newWidth = startWidth
        let newHeight = startHeight
        let newX = startPosX
        let newY = startPosY
        
        if (element.type === 'square') {
            // For rotated squares, we need to transform mouse delta into element's local space
            if (rotation !== 0) {
                // Calculate the center of the element in world space
                const centerX = startPosX + startWidth / 2
                const centerY = startPosY + startHeight / 2
                
                // Get the opposite corner position in local space (relative to center)
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
                
                // Transform opposite corner to world space
                const oppositeCornerWorldX = centerX + oppositeCornerLocalX * Math.cos(rotationRad) - oppositeCornerLocalY * Math.sin(rotationRad)
                const oppositeCornerWorldY = centerY + oppositeCornerLocalX * Math.sin(rotationRad) + oppositeCornerLocalY * Math.cos(rotationRad)
                
                // Get the dragging corner position in local space (relative to center)
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
                
                // Transform drag corner to world space initially
                const dragCornerStartWorldX = centerX + dragCornerLocalX * Math.cos(rotationRad) - dragCornerLocalY * Math.sin(rotationRad)
                const dragCornerStartWorldY = centerY + dragCornerLocalX * Math.sin(rotationRad) + dragCornerLocalY * Math.cos(rotationRad)
                
                // New position of drag corner after mouse movement
                const dragCornerNewWorldX = dragCornerStartWorldX + dx
                const dragCornerNewWorldY = dragCornerStartWorldY + dy
                
                // Calculate vector from opposite corner to new drag corner position
                const newVectorX = dragCornerNewWorldX - oppositeCornerWorldX
                const newVectorY = dragCornerNewWorldY - oppositeCornerWorldY
                
                // Transform this vector to local space to get new dimensions
                const localVectorX = newVectorX * Math.cos(-rotationRad) - newVectorY * Math.sin(-rotationRad)
                const localVectorY = newVectorX * Math.sin(-rotationRad) + newVectorY * Math.cos(-rotationRad)
                
                // New dimensions (distance from opposite corner to drag corner, doubled since corner is at half-size)
                newWidth = Math.abs(localVectorX)
                newHeight = Math.abs(localVectorY)
                
                // Apply minimum size
                newWidth = Math.max(20, newWidth)
                newHeight = Math.max(20, newHeight)
                
                // Calculate new center position (midpoint between opposite corner and new drag corner)
                const newCenterX = oppositeCornerWorldX + newVectorX / 2
                const newCenterY = oppositeCornerWorldY + newVectorY / 2
                
                // Calculate top-left position from center
                newX = newCenterX - newWidth / 2
                newY = newCenterY - newHeight / 2
                
            } else {
                // Non-rotated square - use original logic
                if (corner === 'br') { // bottom-right
                    newWidth = startWidth + dx
                    newHeight = startHeight + dy
                    
                    // Handle flipping
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
                    
                    // Handle flipping
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
                    
                    // Handle flipping
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
                    
                    // Handle flipping
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
                
                // Apply minimum size
                newWidth = Math.max(20, newWidth)
                newHeight = Math.max(20, newHeight)
            }
            
        } else if (element.type === 'circle') {
            // Circle resize - allow independent width/height adjustment (becomes ellipse)
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
            // Line resize - adjust angle and length by moving endpoints
            
            if (corner === 'start') {
                // Moving start point - change angle and position
                // Get current element state (may have changed from previous mousemove)
                const currentElement = elements.find(el => el.id === elementId)
                if (!currentElement) return
                
                const currentTransform = currentElement.styles.transform || 'rotate(0deg)'
                const currentAngleMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
                const currentAngle = currentAngleMatch ? parseFloat(currentAngleMatch[1]) : 0
                const currentAngleRad = currentAngle * (Math.PI / 180)
                
                // Calculate current end point based on current angle and width
                const currentEndX = currentElement.x + currentElement.width * Math.cos(currentAngleRad)
                const currentEndY = currentElement.y + currentElement.width * Math.sin(currentAngleRad)
                
                newX = startPosX + dx
                newY = startPosY + dy
                
                // Calculate new angle and length from new start to current end
                const deltaX = currentEndX - newX
                const deltaY = currentEndY - newY
                const newLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
                
                newWidth = Math.max(10, newLength)
                
                // Store angle in element
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
                return
                
            } else if (corner === 'end') {
                // Moving end point - change angle and length
                // Use mouse position directly as the new end point
                const newEndX = e.clientX
                const newEndY = e.clientY
                
                // Calculate new angle and length from start to new end
                const deltaX = newEndX - startPosX
                const deltaY = newEndY - startPosY
                const newLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
                
                newWidth = Math.max(10, newLength)
                
                // Store angle in element
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
                return
            }
        }
        
        // Update element in array (for non-line or simple updates)
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
    }
    
    function onMouseUp() {
        handleEl.style.cursor = corner.includes('resize') ? handleEl.style.cursor.replace('grabbing', '') : 'grab'
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

export function handleRotation(e, rotationHandle, elements, renderCallback) {
    e.stopPropagation()
    
    const elementId = Number(rotationHandle.dataset.elementId)
    const element = elements.find(el => el.id === elementId)
    
    if (!element) return
    
    const elementDiv = rotationHandle.parentElement
    const rect = elementDiv.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    rotationHandle.style.cursor = 'grabbing'
    
    // Get current rotation if exists
    const currentRotation = element.rotation || 0
    
    function onMouseMove(e) {
        const angle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        ) * (180 / Math.PI)
        
        // Normalize angle
        const normalizedAngle = angle + 90
        
        // Update element in array
        const index = elements.findIndex(el => el.id === elementId)
        if (index !== -1) {
            elements[index] = {
                ...elements[index],
                rotation: normalizedAngle
            }
        }
        
        renderCallback()
    }
    
    function onMouseUp() {
        rotationHandle.style.cursor = 'grab'
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}
