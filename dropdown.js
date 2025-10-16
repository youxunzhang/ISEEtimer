// 下拉菜单功能
function initializeDropdown() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    if (!dropdowns.length) return;

    const closeAll = (exception = null) => {
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!menu || menu === exception) return;

            menu.classList.remove('show');
            if (toggle) {
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    };

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!toggle || !menu) return;

        toggle.setAttribute('aria-expanded', 'false');

        // 点击切换下拉菜单
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = menu.classList.contains('show');

            if (isOpen) {
                menu.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                closeAll(menu);
                menu.classList.add('show');
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');

                const firstItem = menu.querySelector('.dropdown-item');
                if (firstItem) {
                    firstItem.focus();
                }
            }
        });

        // 下拉菜单项点击后关闭
        menu.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-item')) {
                menu.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // 键盘交互
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!menu.classList.contains('show')) {
                    toggle.click();
                } else {
                    const firstItem = menu.querySelector('.dropdown-item');
                    if (firstItem) {
                        firstItem.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                menu.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        menu.addEventListener('keydown', (e) => {
            const items = Array.from(menu.querySelectorAll('.dropdown-item'));
            const currentIndex = items.indexOf(e.target);

            if (!items.length) return;

            switch(e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].focus();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                    items[prevIndex].focus();
                    break;
                }
                case 'Home': {
                    e.preventDefault();
                    items[0].focus();
                    break;
                }
                case 'End': {
                    e.preventDefault();
                    items[items.length - 1].focus();
                    break;
                }
                case 'Escape': {
                    menu.classList.remove('show');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                    break;
                }
            }
        });
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        const isInsideDropdown = Array.from(dropdowns).some(dropdown => dropdown.contains(e.target));
        if (!isInsideDropdown) {
            closeAll();
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
