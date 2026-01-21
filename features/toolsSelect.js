const tools = document.querySelectorAll('.tool')

export function toolSelector(prevTool) {
    console.log(prevTool)
    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            prevTool.style.backgroundColor = 'transparent'
            tool.style.backgroundColor = '#0E81E6'
            prevTool = tool
        })
    })
}