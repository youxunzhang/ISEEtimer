(function() {
    "use strict";

    function createFooter() {
        if (document.querySelector('.site-footer')) {
            return;
        }

        const footerTemplate = `
    <footer class="site-footer" role="contentinfo">
        <div class="footer-wrapper">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="footer-brand-header">
                        <span class="footer-logo" aria-hidden="true">
                            <i class="fas fa-clock"></i>
                        </span>
                        <div>
                            <h3>TimeMaster 在线倒计时器</h3>
                            <p>集在线计时、倒计时、番茄钟于一体的时间管理工具，让每一秒都更有价值。</p>
                        </div>
                    </div>
                    <a class="footer-contact-link" href="mailto:hello@timemaster.com">
                        <i class="fas fa-envelope"></i>
                        hello@timemaster.com
                    </a>
                    <div class="footer-social" aria-label="社交媒体">
                        <span>关注我们</span>
                        <div class="social-links">
                            <a href="#" aria-label="关注 TimeMaster 微信社区">
                                <i class="fab fa-weixin"></i>
                            </a>
                            <a href="#" aria-label="关注 TimeMaster 微博">
                                <i class="fab fa-weibo"></i>
                            </a>
                            <a href="#" aria-label="加入 TimeMaster Telegram 社区">
                                <i class="fab fa-telegram-plane"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h4>核心工具</h4>
                    <ul>
                        <li><a href="fullscreen-countdown.html">全屏倒计时器</a></li>
                        <li><a href="index.html#countdown">倒计时器</a></li>
                        <li><a href="index.html#pomodoro">番茄钟计时</a></li>
                        <li><a href="index.html#stopwatch">秒表功能</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>热门场景</h4>
                    <ul>
                        <li><a href="wedding-countdown.html">婚礼倒计时</a></li>
                        <li><a href="exam-countdown.html">考试倒计时</a></li>
                        <li><a href="birthday-countdown.html">生日倒计时</a></li>
                        <li><a href="festival-countdown.html">重大节日倒计时</a></li>
                        <li><a href="game.html">时间守护者小游戏</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>学习资源</h4>
                    <ul>
                        <li><a href="articles.html">时间管理文章</a></li>
                        <li><a href="article-time-planning.html">一天时间规划</a></li>
                        <li><a href="article-website-planning.html">网站规划指南</a></li>
                        <li><a href="how-to-create-countdown-timer.html">倒计时器制作教程</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© <span id="currentYear"></span> TimeMaster · 专注打造优雅的在线倒计时体验。</p>
                <div class="footer-bottom-links">
                    <a href="articles.html">文章专栏</a>
                    <a href="sitemap.html">网站地图</a>
                    <a href="mailto:hello@timemaster.com">联系我们</a>
                </div>
            </div>
        </div>
    </footer>`;

        document.body.insertAdjacentHTML('beforeend', footerTemplate);

        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFooter);
    } else {
        createFooter();
    }
})();
