export function showLoading(loadingIndicator, jsonExportBtn, htmlExportBtn) {
    loadingIndicator.style.opacity = '1'
    loadingIndicator.style.pointerEvents = 'auto'
    jsonExportBtn.style.opacity = '0.5'
    jsonExportBtn.style.pointerEvents = 'none'
    htmlExportBtn.style.opacity = '0.5'
    htmlExportBtn.style.pointerEvents = 'none'
}

export function hideLoading(loadingIndicator, jsonExportBtn, htmlExportBtn) {
    loadingIndicator.style.opacity = '0'
    loadingIndicator.style.pointerEvents = 'none'
    jsonExportBtn.style.opacity = '1'
    jsonExportBtn.style.pointerEvents = 'auto'
    htmlExportBtn.style.opacity = '1'
    htmlExportBtn.style.pointerEvents = 'auto'
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function exportJSON(elements, loadingIndicator, jsonExportBtn, htmlExportBtn) {
    showLoading(loadingIndicator, jsonExportBtn, htmlExportBtn)
    
    setTimeout(() => {
        const jsonData = JSON.stringify(elements, null, 2)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        downloadFile(jsonData, `figma-design-${timestamp}.json`, 'application/json')
        hideLoading(loadingIndicator, jsonExportBtn, htmlExportBtn)
    }, 500)
}

export function exportHTML(elements, loadingIndicator, jsonExportBtn, htmlExportBtn) {
    showLoading(loadingIndicator, jsonExportBtn, htmlExportBtn)
    
    setTimeout(() => {
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background: #1a1a1a;
            min-height: 100vh;
        }
        .canvas {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
        .element {
            position: absolute;
        }
    </style>
</head>
<body>
    <div class="canvas">
`

        elements.forEach((element, index) => {
            const styles = []
            styles.push(`left: ${element.x}px`)
            styles.push(`top: ${element.y}px`)
            styles.push(`z-index: ${index}`)
            
            if (element.type === 'text') {
                styles.push(`color: ${element.styles.backgroundColor || '#000000'}`)
                styles.push(`font-size: ${element.fontSize || 16}px`)
                styles.push(`white-space: pre-wrap`)
                styles.push(`word-wrap: break-word`)
                
                if (element.rotation) {
                    styles.push(`transform: rotate(${element.rotation}deg)`)
                    styles.push(`transform-origin: top left`)
                }
                
                htmlContent += `        <div class="element" style="${styles.join('; ')}">${element.text || 'Text'}</div>\n`
            } else {
                styles.push(`width: ${Math.abs(element.width)}px`)
                
                if (element.type === 'line') {
                    styles.push(`height: 2px`)
                } else {
                    styles.push(`height: ${Math.abs(element.height)}px`)
                }
                
                if (element.styles.backgroundColor) {
                    styles.push(`background-color: ${element.styles.backgroundColor}`)
                }
                
                if (element.styles.borderWidth && parseInt(element.styles.borderWidth) > 0) {
                    styles.push(`border: ${element.styles.borderWidth} solid ${element.styles.borderColor || '#000000'}`)
                }
                
                if (element.styles.borderRadius) {
                    styles.push(`border-radius: ${element.styles.borderRadius}`)
                }
                
                if (element.rotation) {
                    styles.push(`transform: rotate(${element.rotation}deg)`)
                    styles.push(`transform-origin: center center`)
                } else if (element.type === 'line' && element.styles.transform) {
                    styles.push(`transform: ${element.styles.transform}`)
                    styles.push(`transform-origin: 0 0`)
                }
                
                htmlContent += `        <div class="element" style="${styles.join('; ')}"></div>\n`
            }
        })

        htmlContent += `    </div>
</body>
</html>`

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        downloadFile(htmlContent, `figma-design-${timestamp}.html`, 'text/html')
        hideLoading(loadingIndicator, jsonExportBtn, htmlExportBtn)
    }, 800)
}
