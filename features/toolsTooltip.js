export function handleToolsToolTip(tooltip, toolData) {
    toolData.forEach(({ element, label }) => {
        element.addEventListener('mouseenter', () => {
            tooltip.classList.remove('opacity-0')
            tooltip.classList.add('opacity-100')
            tooltip.textContent = label
        })
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('opacity-100')
            tooltip.classList.add('opacity-0')
        })
    })
}