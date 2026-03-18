(function () {
    'use strict';

    const DAY_MS = 24 * 60 * 60 * 1000;

    function setStatus(element, text, level) {
        if (!element) return;
        element.textContent = text || '';
        element.className = 'status-text';
        if (level) {
            element.classList.add(level);
        }
    }

    function formatParts(diffMs) {
        const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { days, hours, minutes, seconds };
    }

    function updateCountdownSummary(prefix, targetDate, nodes, finalMessage) {
        const diffMs = targetDate.getTime() - Date.now();
        if (diffMs <= 0) {
            nodes.days.textContent = '0';
            nodes.hours.textContent = '0';
            nodes.minutes.textContent = '0';
            nodes.seconds.textContent = '0';
            setStatus(nodes.status, finalMessage, 'success');
            return false;
        }

        const { days, hours, minutes, seconds } = formatParts(diffMs);
        nodes.days.textContent = String(days);
        nodes.hours.textContent = String(hours);
        nodes.minutes.textContent = String(minutes);
        nodes.seconds.textContent = String(seconds);
        setStatus(nodes.status, `${prefix}: ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds remaining.`, 'success');
        return true;
    }

    function initCountdownTool() {
        const root = document.querySelector('[data-tool="countdown"]');
        if (!root) return;

        const dateInput = root.querySelector('[data-role="date"]');
        const timeInput = root.querySelector('[data-role="time"]');
        const startButton = root.querySelector('[data-action="start"]');
        const resetButton = root.querySelector('[data-action="reset"]');
        const nodes = {
            days: root.querySelector('[data-output="days"]'),
            hours: root.querySelector('[data-output="hours"]'),
            minutes: root.querySelector('[data-output="minutes"]'),
            seconds: root.querySelector('[data-output="seconds"]'),
            status: root.querySelector('[data-role="status"]')
        };
        const prefix = root.dataset.messagePrefix || 'Time left';
        const finalMessage = root.dataset.finalMessage || 'The target date has arrived.';
        const defaultHour = root.dataset.defaultHour || '09:00';
        let timerId = null;

        if (!dateInput.value) {
            const preset = new Date();
            preset.setDate(preset.getDate() + 30);
            dateInput.value = preset.toISOString().slice(0, 10);
        }
        if (timeInput && !timeInput.value) {
            timeInput.value = defaultHour;
        }

        function clearTimer() {
            if (timerId) {
                window.clearInterval(timerId);
                timerId = null;
            }
        }

        function readTarget() {
            if (!dateInput.value) {
                setStatus(nodes.status, 'Please choose a target date first.', 'warning');
                return null;
            }
            const timeValue = timeInput && timeInput.value ? timeInput.value : defaultHour;
            const target = new Date(`${dateInput.value}T${timeValue || '00:00'}:00`);
            if (Number.isNaN(target.getTime())) {
                setStatus(nodes.status, 'The selected date is invalid. Please try again.', 'error');
                return null;
            }
            return target;
        }

        function start() {
            const target = readTarget();
            if (!target) return;
            clearTimer();
            const active = updateCountdownSummary(prefix, target, nodes, finalMessage);
            if (active) {
                timerId = window.setInterval(function () {
                    const keepGoing = updateCountdownSummary(prefix, target, nodes, finalMessage);
                    if (!keepGoing) {
                        clearTimer();
                    }
                }, 1000);
            }
        }

        function reset() {
            clearTimer();
            root.querySelectorAll('[data-output]').forEach(function (item) {
                item.textContent = '0';
            });
            setStatus(nodes.status, 'Choose a date and start the countdown to see live results.', '');
        }

        startButton.addEventListener('click', start);
        resetButton.addEventListener('click', reset);
        start();
    }

    function fullDaysBetween(startDate, endDate) {
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return Math.round((end - start) / DAY_MS);
    }

    function monthDayDiff(fromDate, toDate) {
        let years = toDate.getFullYear() - fromDate.getFullYear();
        let months = toDate.getMonth() - fromDate.getMonth();
        let days = toDate.getDate() - fromDate.getDate();

        if (days < 0) {
            const previousMonthDays = new Date(toDate.getFullYear(), toDate.getMonth(), 0).getDate();
            days += previousMonthDays;
            months -= 1;
        }

        if (months < 0) {
            months += 12;
            years -= 1;
        }

        return { years, months, days };
    }

    function initAgeCalculator() {
        const root = document.querySelector('[data-tool="age-calculator"]');
        if (!root) return;
        const birthInput = root.querySelector('[data-role="birthdate"]');
        const calcButton = root.querySelector('[data-action="calculate-age"]');
        const outputs = {
            years: root.querySelector('[data-output="years"]'),
            months: root.querySelector('[data-output="months"]'),
            days: root.querySelector('[data-output="days"]'),
            nextBirthday: root.querySelector('[data-output="nextBirthday"]'),
            status: root.querySelector('[data-role="status"]')
        };

        const defaultBirth = new Date();
        defaultBirth.setFullYear(defaultBirth.getFullYear() - 25);
        birthInput.value = defaultBirth.toISOString().slice(0, 10);

        calcButton.addEventListener('click', function () {
            if (!birthInput.value) {
                setStatus(outputs.status, 'Please enter a birth date.', 'warning');
                return;
            }
            const birthDate = new Date(`${birthInput.value}T00:00:00`);
            const now = new Date();
            if (birthDate > now) {
                setStatus(outputs.status, 'Birth dates in the future are not supported.', 'error');
                return;
            }

            const diff = monthDayDiff(birthDate, now);
            outputs.years.textContent = String(diff.years);
            outputs.months.textContent = String(diff.years * 12 + diff.months);
            outputs.days.textContent = String(fullDaysBetween(birthDate, now));

            const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
            }
            outputs.nextBirthday.textContent = String(fullDaysBetween(now, nextBirthday));
            setStatus(outputs.status, `Exact age: ${diff.years} years, ${diff.months} months, and ${diff.days} days.`, 'success');
        });

        calcButton.click();
    }

    function initDaysBetweenCalculator() {
        const root = document.querySelector('[data-tool="days-between"]');
        if (!root) return;
        const startInput = root.querySelector('[data-role="start-date"]');
        const endInput = root.querySelector('[data-role="end-date"]');
        const includeToggle = root.querySelector('[data-role="include-end"]');
        const calcButton = root.querySelector('[data-action="calculate-days-between"]');
        const outputs = {
            totalDays: root.querySelector('[data-output="totalDays"]'),
            weeks: root.querySelector('[data-output="weeks"]'),
            businessDays: root.querySelector('[data-output="businessDays"]'),
            status: root.querySelector('[data-role="status"]')
        };

        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(now.getDate() + 30);
        startInput.value = now.toISOString().slice(0, 10);
        endInput.value = thirtyDays.toISOString().slice(0, 10);

        function countBusinessDays(start, end) {
            const direction = start <= end ? 1 : -1;
            let current = new Date(start);
            let count = 0;
            while ((direction === 1 && current <= end) || (direction === -1 && current >= end)) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) {
                    count += 1;
                }
                current.setDate(current.getDate() + direction);
            }
            return count;
        }

        calcButton.addEventListener('click', function () {
            if (!startInput.value || !endInput.value) {
                setStatus(outputs.status, 'Please select both dates.', 'warning');
                return;
            }
            const start = new Date(`${startInput.value}T00:00:00`);
            const end = new Date(`${endInput.value}T00:00:00`);
            const total = fullDaysBetween(start, end) + (includeToggle.checked ? 1 : 0);
            outputs.totalDays.textContent = String(total);
            outputs.weeks.textContent = (total / 7).toFixed(2);
            outputs.businessDays.textContent = String(countBusinessDays(start, end));
            setStatus(outputs.status, `There are ${total} days between the selected dates${includeToggle.checked ? ' when counting both start and end dates' : ''}.`, 'success');
        });

        calcButton.click();
    }

    function initHowManyDaysUntil() {
        const root = document.querySelector('[data-tool="how-many-days-until"]');
        if (!root) return;
        const dateInput = root.querySelector('[data-role="target-date"]');
        const calcButton = root.querySelector('[data-action="calculate-until-days"]');
        const outputs = {
            days: root.querySelector('[data-output="days"]'),
            weeks: root.querySelector('[data-output="weeks"]'),
            months: root.querySelector('[data-output="months"]'),
            status: root.querySelector('[data-role="status"]')
        };

        const future = new Date();
        future.setDate(future.getDate() + 100);
        dateInput.value = future.toISOString().slice(0, 10);

        calcButton.addEventListener('click', function () {
            if (!dateInput.value) {
                setStatus(outputs.status, 'Please choose a target date.', 'warning');
                return;
            }
            const now = new Date();
            const target = new Date(`${dateInput.value}T00:00:00`);
            const days = fullDaysBetween(now, target);
            outputs.days.textContent = String(days);
            outputs.weeks.textContent = (days / 7).toFixed(1);
            outputs.months.textContent = (days / 30.44).toFixed(1);
            setStatus(outputs.status, days >= 0 ? `${days} full days remain until ${dateInput.value}.` : `${Math.abs(days)} full days have passed since ${dateInput.value}.`, days >= 0 ? 'success' : 'warning');
        });

        calcButton.click();
    }

    function initTimeUntilDate() {
        const root = document.querySelector('[data-tool="time-until-date"]');
        if (!root) return;
        const dateInput = root.querySelector('[data-role="target-date"]');
        const timeInput = root.querySelector('[data-role="target-time"]');
        const calcButton = root.querySelector('[data-action="calculate-time-until"]');
        const outputs = {
            days: root.querySelector('[data-output="days"]'),
            hours: root.querySelector('[data-output="hours"]'),
            minutes: root.querySelector('[data-output="minutes"]'),
            status: root.querySelector('[data-role="status"]')
        };

        const target = new Date();
        target.setDate(target.getDate() + 10);
        dateInput.value = target.toISOString().slice(0, 10);
        timeInput.value = '09:00';

        calcButton.addEventListener('click', function () {
            if (!dateInput.value) {
                setStatus(outputs.status, 'Please choose a future date.', 'warning');
                return;
            }
            const chosen = new Date(`${dateInput.value}T${timeInput.value || '00:00'}:00`);
            const diffMs = chosen.getTime() - Date.now();
            const parts = formatParts(Math.abs(diffMs));
            outputs.days.textContent = String(parts.days);
            outputs.hours.textContent = String(parts.hours);
            outputs.minutes.textContent = String(parts.minutes);
            setStatus(outputs.status, diffMs >= 0 ? `Time remaining until ${dateInput.value} ${timeInput.value}: ${parts.days} days, ${parts.hours} hours, and ${parts.minutes} minutes.` : `${parts.days} days, ${parts.hours} hours, and ${parts.minutes} minutes have passed since ${dateInput.value} ${timeInput.value}.`, diffMs >= 0 ? 'success' : 'warning');
        });

        calcButton.click();
    }

    function initDateCalculator() {
        const root = document.querySelector('[data-tool="date-calculator"]');
        if (!root) return;
        const baseInput = root.querySelector('[data-role="base-date"]');
        const amountInput = root.querySelector('[data-role="amount"]');
        const unitInput = root.querySelector('[data-role="unit"]');
        const directionInput = root.querySelector('[data-role="direction"]');
        const calcButton = root.querySelector('[data-action="calculate-date"]');
        const outputs = {
            resultDate: root.querySelector('[data-output="resultDate"]'),
            weekday: root.querySelector('[data-output="weekday"]'),
            dayOfYear: root.querySelector('[data-output="dayOfYear"]'),
            status: root.querySelector('[data-role="status"]')
        };

        baseInput.value = new Date().toISOString().slice(0, 10);
        amountInput.value = '30';

        calcButton.addEventListener('click', function () {
            if (!baseInput.value) {
                setStatus(outputs.status, 'Please choose a base date.', 'warning');
                return;
            }
            const result = new Date(`${baseInput.value}T00:00:00`);
            const amount = Number(amountInput.value || 0);
            const direction = directionInput.value === 'subtract' ? -1 : 1;
            const delta = amount * direction;

            if (unitInput.value === 'days') {
                result.setDate(result.getDate() + delta);
            } else if (unitInput.value === 'weeks') {
                result.setDate(result.getDate() + delta * 7);
            } else if (unitInput.value === 'months') {
                result.setMonth(result.getMonth() + delta);
            } else if (unitInput.value === 'years') {
                result.setFullYear(result.getFullYear() + delta);
            }

            const startOfYear = new Date(result.getFullYear(), 0, 0);
            const dayOfYear = Math.floor((result - startOfYear) / DAY_MS);
            outputs.resultDate.textContent = result.toISOString().slice(0, 10);
            outputs.weekday.textContent = result.toLocaleDateString('en-US', { weekday: 'long' });
            outputs.dayOfYear.textContent = String(dayOfYear);
            setStatus(outputs.status, `The calculated date is ${result.toISOString().slice(0, 10)}.`, 'success');
        });

        calcButton.click();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initCountdownTool();
        initAgeCalculator();
        initDaysBetweenCalculator();
        initHowManyDaysUntil();
        initTimeUntilDate();
        initDateCalculator();
    });
})();
