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
                            <h3>TimeMaster Online Countdown Timer</h3>
                            <p>An all-in-one timer suite with online timers, countdowns, and Pomodoro sessions to make every second count.</p>
                        </div>
                    </div>
                    <a class="footer-contact-link" href="mailto:hello@timemaster.com">
                        <i class="fas fa-envelope"></i>
                        hello@timemaster.com
                    </a>
                    <div class="footer-social" aria-label="Social media">
                        <span>Follow Us</span>
                        <div class="social-links">
                            <a href="#" aria-label="Join the TimeMaster WeChat community">
                                <i class="fab fa-weixin"></i>
                            </a>
                            <a href="#" aria-label="Follow TimeMaster on Weibo">
                                <i class="fab fa-weibo"></i>
                            </a>
                            <a href="#" aria-label="Join the TimeMaster Telegram community">
                                <i class="fab fa-telegram-plane"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h4>Core Tools</h4>
                    <ul>
                        <li><a href="fullscreen-countdown.html">Fullscreen Countdown</a></li>
                        <li><a href="index.html#countdown">Countdown Timer</a></li>
                        <li><a href="index.html#pomodoro">Pomodoro Timer</a></li>
                        <li><a href="index.html#stopwatch">Stopwatch</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Popular Uses</h4>
                    <ul>
                        <li><a href="wedding-countdown.html">Wedding Countdown</a></li>
                        <li><a href="exam-countdown.html">Exam Countdown</a></li>
                        <li><a href="birthday-countdown.html">Birthday Countdown</a></li>
                        <li><a href="holiday-background-countdown.html">Holiday Background Countdown</a></li>
                        <li><a href="festival-countdown.html">Holiday & Festival Countdowns</a></li>
                        <li><a href="game.html">Time Guardian Mini Game</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Learning Resources</h4>
                    <ul>
                        <li><a href="articles.html">Time Management Articles</a></li>
                        <li><a href="article-time-planning.html">Daily Time Planning</a></li>
                        <li><a href="article-website-planning.html">Website Planning Guide</a></li>
                        <li><a href="how-to-create-countdown-timer.html">Countdown Timer Tutorial</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© <span id="currentYear"></span> TimeMaster · Dedicated to crafting an elegant online countdown experience.</p>
                <div class="footer-bottom-links">
                    <a href="articles.html">Articles Hub</a>
                    <a href="sitemap.html">Sitemap</a>
                    <a href="mailto:hello@timemaster.com">Contact Us</a>
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
