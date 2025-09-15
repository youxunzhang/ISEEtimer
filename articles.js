// 文章页面JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 文章搜索功能
    const searchInput = document.getElementById('articleSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');

    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterArticles(searchTerm);
        });
    }

    // 分类筛选功能
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterArticlesByCategory(filter);
        });
    });

    // 筛选文章函数
    function filterArticles(searchTerm = '') {
        const activeFilter = document.querySelector('.filter-btn.active');
        const currentFilter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        
        articleCards.forEach(card => {
            const title = card.querySelector('.article-title a').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = searchTerm === '' || 
                title.includes(searchTerm) || 
                excerpt.includes(searchTerm) || 
                tags.some(tag => tag.includes(searchTerm));
            
            const matchesCategory = currentFilter === 'all' || 
                card.getAttribute('data-category') === currentFilter;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
        
        // 更新文章列表显示
        updateArticleListVisibility();
    }

    // 按分类筛选文章
    function filterArticlesByCategory(category) {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        filterArticles(searchTerm);
    }

    // 更新文章列表可见性
    function updateArticleListVisibility() {
        const visibleCards = Array.from(articleCards).filter(card => 
            card.style.display !== 'none'
        );
        
        const articlesList = document.querySelector('.articles-list');
        if (articlesList) {
            if (visibleCards.length === 0) {
                // 显示无结果提示
                showNoResultsMessage();
            } else {
                // 隐藏无结果提示
                hideNoResultsMessage();
            }
        }
    }

    // 显示无结果提示
    function showNoResultsMessage() {
        let noResultsMsg = document.getElementById('noResultsMessage');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>未找到相关文章</h3>
                    <p>请尝试其他关键词或选择不同的分类</p>
                    <button class="btn btn-primary" onclick="clearFilters()">
                        <i class="fas fa-refresh"></i>
                        清除筛选
                    </button>
                </div>
            `;
            
            const articlesList = document.querySelector('.articles-list');
            if (articlesList) {
                articlesList.appendChild(noResultsMsg);
            }
        }
        noResultsMsg.style.display = 'block';
    }

    // 隐藏无结果提示
    function hideNoResultsMessage() {
        const noResultsMsg = document.getElementById('noResultsMessage');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    // 清除筛选（全局函数）
    window.clearFilters = function() {
        // 清除搜索框
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 重置分类筛选
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const allButton = document.querySelector('.filter-btn[data-filter="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }
        
        // 显示所有文章
        articleCards.forEach(card => {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.3s ease';
        });
        
        // 隐藏无结果提示
        hideNoResultsMessage();
    };

    // 文章卡片点击统计
    articleCards.forEach(card => {
        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink) {
            readMoreLink.addEventListener('click', function(e) {
                // 可以在这里添加点击统计逻辑
                console.log('Article clicked:', card.querySelector('.article-title a').textContent);
            });
        }
    });

    // 推荐文章点击统计
    const featuredCards = document.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
        const link = card.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                console.log('Featured article clicked:', this.textContent);
            });
        }
    });

    // 键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // ESC 清除筛选
        if (e.key === 'Escape') {
            clearFilters();
        }
    });

    // 搜索框焦点提示
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.placeholder = '按 Enter 搜索，ESC 清除筛选';
        });
        
        searchInput.addEventListener('blur', function() {
            this.placeholder = '搜索文章...';
        });
        
        // 回车键搜索
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterArticles(this.value.toLowerCase().trim());
            }
        });
    }

    // 文章阅读进度跟踪
    function trackReadingProgress() {
        const articleContent = document.querySelector('.article-content-detail');
        if (!articleContent) return;

        const articleHeight = articleContent.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        const articleTop = articleContent.offsetTop;
        const articleBottom = articleTop + articleHeight;

        if (scrollTop >= articleTop && scrollTop <= articleBottom) {
            const progress = Math.min(100, Math.max(0, 
                ((scrollTop - articleTop) / (articleHeight - windowHeight)) * 100
            ));
            
            // 可以在这里添加阅读进度条或统计逻辑
            console.log('Reading progress:', Math.round(progress) + '%');
        }
    }

    // 监听滚动事件
    window.addEventListener('scroll', trackReadingProgress);

    // 文章分享功能增强
    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'reddit':
                    shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // 文章收藏功能
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            this.classList.toggle('bookmarked');
            
            if (this.classList.contains('bookmarked')) {
                showNotification('文章已收藏！', 'success');
                // 可以在这里添加收藏到本地存储的逻辑
                localStorage.setItem('bookmarked_articles', JSON.stringify(
                    [...(JSON.parse(localStorage.getItem('bookmarked_articles') || '[]')), 
                     window.location.href]
                ));
            } else {
                showNotification('已取消收藏', 'info');
                // 从本地存储中移除
                const bookmarked = JSON.parse(localStorage.getItem('bookmarked_articles') || '[]');
                const filtered = bookmarked.filter(url => url !== window.location.href);
                localStorage.setItem('bookmarked_articles', JSON.stringify(filtered));
            }
        });
        
        // 检查是否已收藏
        const bookmarked = JSON.parse(localStorage.getItem('bookmarked_articles') || '[]');
        if (bookmarked.includes(window.location.href)) {
            bookmarkBtn.classList.add('bookmarked');
        }
    }

    // 通知功能
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = `notification show ${type}`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // 文章标签点击功能
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.toLowerCase();
            if (searchInput) {
                searchInput.value = tagText;
                filterArticles(tagText);
            }
        });
        
        // 添加点击样式
        tag.style.cursor = 'pointer';
        tag.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'var(--accent-color)';
            this.style.color = 'white';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'var(--bg-tertiary)';
            this.style.color = 'var(--text-secondary)';
        });
    });

    // 响应式处理
    function handleResponsive() {
        const isMobile = window.innerWidth <= 768;
        const articlesList = document.querySelector('.articles-list');
        
        if (articlesList) {
            if (isMobile) {
                articlesList.classList.add('mobile-layout');
            } else {
                articlesList.classList.remove('mobile-layout');
            }
        }
    }

    // 监听窗口大小变化
    window.addEventListener('resize', handleResponsive);
    handleResponsive(); // 初始调用

    console.log('文章页面功能已加载完成');
});
