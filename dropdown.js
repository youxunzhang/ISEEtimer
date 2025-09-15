// 下拉菜单功能
function initializeDropdown() {
    const dropdownToggle = document.getElementById('festivalDropdown');
    const dropdownMenu = document.getElementById('festivalMenu');
    
    if (!dropdownToggle || !dropdownMenu) return;
    
    // 点击切换下拉菜单
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = dropdownMenu.classList.contains('show');
        
        // 关闭所有其他下拉菜单
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu !== dropdownMenu) {
                menu.classList.remove('show');
                menu.previousElementSibling.classList.remove('active');
            }
        });
        
        // 切换当前下拉菜单
        if (isOpen) {
            dropdownMenu.classList.remove('show');
            dropdownToggle.classList.remove('active');
        } else {
            dropdownMenu.classList.add('show');
            dropdownToggle.classList.add('active');
        }
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            dropdownToggle.classList.remove('active');
        }
    });
    
    // 点击下拉菜单项后关闭菜单
    dropdownMenu.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-item')) {
            dropdownMenu.classList.remove('show');
            dropdownToggle.classList.remove('active');
        }
    });
    
    // 键盘导航支持
    dropdownToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dropdownToggle.click();
        } else if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
            dropdownToggle.classList.remove('active');
        }
    });
    
    // 下拉菜单项键盘导航
    dropdownMenu.addEventListener('keydown', (e) => {
        const items = Array.from(dropdownMenu.querySelectorAll('.dropdown-item'));
        const currentIndex = items.indexOf(e.target);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                items[prevIndex].focus();
                break;
            case 'Escape':
                dropdownMenu.classList.remove('show');
                dropdownToggle.classList.remove('active');
                dropdownToggle.focus();
                break;
        }
    });
}

// 主题切换功能
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    let currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
    }
    
    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    themeToggle.addEventListener('click', toggleTheme);
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdown();
    initializeTheme();
});
