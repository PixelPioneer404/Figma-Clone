const tabMenuMap = [
    { tab: 'create', menu: 'tab-create' },
    { tab: 'export', menu: 'tab-export' }
]

export function switchTab(el) {
    const currentTab = document.querySelector('.active-tab')
    const indicator = document.querySelector('#tab-indicator')
    currentTab.classList.remove('active-tab')
    el.classList.add('active-tab')
    const tabRect = el.getBoundingClientRect()
    const containerRect = el.parentElement.getBoundingClientRect()
    const left = tabRect.left - containerRect.left
    const width = tabRect.width
    indicator.style.left = `${left}px`
    indicator.style.width = `${width}px`

    const clickedTabName = el.id
    tabMenuMap.forEach((item) => {
        if (item.tab === clickedTabName) {
            const menu = document.querySelector(`#${item.menu}`)
            const activeMenu = document.querySelector('.active-menu')
            activeMenu.classList.remove('active-menu')
            menu.classList.add('active-menu')
        }
    })
}