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
                            <h3>ISEEtime Online</h3>
                            <p>A growing matrix of countdown timers and date calculators built for birthdays, weddings, exams, holidays and planning tasks.</p>
                        </div>
                    </div>
                    <a class="footer-contact-link" href="mailto:hello@iseetime.online">
                        <i class="fas fa-envelope"></i>
                        hello@iseetime.online
                    </a>
                </div>
                <div class="footer-column">
                    <h4>Popular Countdowns</h4>
                    <ul>
                        <li><a href="birthday-countdown.html">Birthday Countdown</a></li>
                        <li><a href="wedding-countdown.html">Wedding Countdown</a></li>
                        <li><a href="exam-countdown.html">Exam Countdown</a></li>
                        <li><a href="anniversary-countdown.html">Anniversary Countdown</a></li>
                        <li><a href="christmas-countdown.html">Countdown to Christmas</a></li>
                        <li><a href="new-year-countdown.html">Countdown to New Year</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Date Calculators</h4>
                    <ul>
                        <li><a href="age-calculator.html">Age Calculator</a></li>
                        <li><a href="days-between-dates.html">Days Between Dates</a></li>
                        <li><a href="how-many-days-until.html">How Many Days Until</a></li>
                        <li><a href="date-calculator.html">Date Calculator</a></li>
                        <li><a href="time-until-date.html">Time Until a Date</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>More Tools</h4>
                    <ul>
                        <li><a href="festival-countdown.html">Festival Countdowns</a></li>
                        <li><a href="fullscreen-countdown.html">Fullscreen Countdown</a></li>
                        <li><a href="world-time-tools.html">World Time Tools</a></li>
                        <li><a href="articles.html">Articles Hub</a></li>
                        <li><a href="sitemap.html">Sitemap</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© <span id="currentYear"></span> ISEEtime Online · Free countdown timers and date calculators for focused search intent.</p>
                <div class="footer-bottom-links">
                    <a href="index.html">Home</a>
                    <a href="sitemap.html">Sitemap</a>
                    <a href="mailto:hello@iseetime.online">Contact</a>
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
