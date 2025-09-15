// 全局变量
let currentTheme = localStorage.getItem('theme') || 'light';
let activeTab = 'stopwatch';

// 性能优化变量
let lastUpdateTime = 0;
let animationFrameId = null;
let pageVisibilityStart = 0;
let accumulatedTime = 0;

// Web Worker for background timer
let timerWorker = null;

// 计时器相关变量
let timerInterval = null;
let timerRunning = false;
let timerTime = 0;
let timerStartTime = 0;
let timerPausedTime = 0;

// 倒计时相关变量
let countdownInterval = null;
let countdownRunning = false;
let countdownTime = 0;
let countdownTotal = 0;
let countdownStartTime = 0;
let countdownPausedTime = 0;

// 番茄钟相关变量
let pomodoroInterval = null;
let pomodoroRunning = false;
let pomodoroTime = 0;
let pomodoroTotal = 0;
let pomodoroPhase = 'work'; // 'work', 'break', 'longBreak'
let pomodoroRound = 1;
let pomodoroStartTime = 0;
let pomodoroPausedTime = 0;

// 秒表相关变量
let stopwatchInterval = null;
let stopwatchRunning = false;
let stopwatchTime = 0;
let stopwatchStartTime = 0;
let stopwatchPausedTime = 0;
let lapTimes = [];
let lastStopwatchUpdate = 0;

// 计时精度控制
const TIMER_PRECISION = 1000; // 1秒
const STOPWATCH_PRECISION = 10; // 10毫秒
const DISPLAY_UPDATE_RATE = 16; // ~60fps

// DOM 元素
const elements = {
    // 导航
    navItems: document.querySelectorAll('.nav-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    themeToggle: document.getElementById('themeToggle'),
    
    // 收藏和分享
    bookmarkBtn: document.getElementById('bookmarkBtn'),
    shareBtn: document.getElementById('shareBtn'),
    sharePanel: document.getElementById('sharePanel'),
    
    // 计时器
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    hourInput: document.getElementById('hourInput'),
    minuteInput: document.getElementById('minuteInput'),
    secondInput: document.getElementById('secondInput'),
    startTimer: document.getElementById('startTimer'),
    pauseTimer: document.getElementById('pauseTimer'),
    resetTimer: document.getElementById('resetTimer'),
    
    // 倒计时
    countdownHours: document.getElementById('countdownHours'),
    countdownMinutes: document.getElementById('countdownMinutes'),
    countdownSeconds: document.getElementById('countdownSeconds'),
    countdownHourInput: document.getElementById('countdownHourInput'),
    countdownMinuteInput: document.getElementById('countdownMinuteInput'),
    countdownSecondInput: document.getElementById('countdownSecondInput'),
    startCountdown: document.getElementById('startCountdown'),
    pauseCountdown: document.getElementById('pauseCountdown'),
    resetCountdown: document.getElementById('resetCountdown'),
    
    // 番茄钟
    pomodoroMinutes: document.getElementById('pomodoroMinutes'),
    pomodoroSeconds: document.getElementById('pomodoroSeconds'),
    pomodoroLabel: document.getElementById('pomodoroLabel'),
    pomodoroProgress: document.getElementById('pomodoroProgress'),
    pomodoroProgressText: document.getElementById('pomodoroProgressText'),
    workTime: document.getElementById('workTime'),
    breakTime: document.getElementById('breakTime'),
    longBreakTime: document.getElementById('longBreakTime'),
    startPomodoro: document.getElementById('startPomodoro'),
    pausePomodoro: document.getElementById('pausePomodoro'),
    resetPomodoro: document.getElementById('resetPomodoro'),
    
    // 秒表
    stopwatchHours: document.getElementById('stopwatchHours'),
    stopwatchMinutes: document.getElementById('stopwatchMinutes'),
    stopwatchSeconds: document.getElementById('stopwatchSeconds'),
    stopwatchMilliseconds: document.getElementById('stopwatchMilliseconds'),
    startStopwatch: document.getElementById('startStopwatch'),
    pauseStopwatch: document.getElementById('pauseStopwatch'),
    lapStopwatch: document.getElementById('lapStopwatch'),
    resetStopwatch: document.getElementById('resetStopwatch'),
    lapList: document.getElementById('lapList'),
    
    // 通知
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEventListeners();
    initializeTimerWorker();
    updateTimerDisplay();
    updateCountdownDisplay();
    updatePomodoroFromInputs(); // 确保番茄钟正确初始化
    initializeStopwatch(); // 确保秒表正确初始化
});

// 初始化Web Worker
function initializeTimerWorker() {
    if (typeof Worker !== 'undefined') {
        try {
            timerWorker = new Worker('timer-worker.js');
            timerWorker.onmessage = function(e) {
                const { type, data } = e.data;
                if (type === 'STATUS_UPDATE') {
                    // 更新本地计时器状态
                    if (data.timer.running) {
                        timerTime = data.timer.currentTime;
                        updateTimerDisplay();
                    }
                    if (data.countdown.running) {
                        countdownTime = data.countdown.currentTime;
                        updateCountdownDisplay();
                        if (countdownTime <= 0) {
                            pauseCountdown();
                            showNotification('倒计时结束！');
                            playNotificationSound();
                        }
                    }
                    if (data.pomodoro.running) {
                        pomodoroTime = data.pomodoro.currentTime;
                        updatePomodoroDisplay();
                        if (pomodoroTime <= 0) {
                            pausePomodoro();
                            handlePomodoroComplete();
                        }
                    }
                    if (data.stopwatch.running) {
                        stopwatchTime = data.stopwatch.currentTime;
                        updateStopwatchDisplay();
                    }
                }
            };
        } catch (error) {
            console.log('Web Worker not supported, using fallback method');
        }
    }
}

// 主题管理
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// 事件监听器
function initializeEventListeners() {
    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // 标签页切换
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // 计时器事件
    elements.startTimer.addEventListener('click', startTimer);
    elements.pauseTimer.addEventListener('click', pauseTimer);
    elements.resetTimer.addEventListener('click', resetTimer);
    
    // 倒计时事件
    elements.startCountdown.addEventListener('click', startCountdown);
    elements.pauseCountdown.addEventListener('click', pauseCountdown);
    elements.resetCountdown.addEventListener('click', resetCountdown);
    
    // 番茄钟事件
    elements.startPomodoro.addEventListener('click', startPomodoro);
    elements.pausePomodoro.addEventListener('click', pausePomodoro);
    elements.resetPomodoro.addEventListener('click', resetPomodoro);
    
    // 秒表事件
    elements.startStopwatch.addEventListener('click', startStopwatch);
    elements.pauseStopwatch.addEventListener('click', pauseStopwatch);
    elements.lapStopwatch.addEventListener('click', lapStopwatch);
    elements.resetStopwatch.addEventListener('click', resetStopwatch);
    
    // 输入框事件
    elements.hourInput.addEventListener('change', updateTimerFromInputs);
    elements.minuteInput.addEventListener('change', updateTimerFromInputs);
    elements.secondInput.addEventListener('change', updateTimerFromInputs);
    
    elements.countdownHourInput.addEventListener('change', updateCountdownFromInputs);
    elements.countdownMinuteInput.addEventListener('change', updateCountdownFromInputs);
    elements.countdownSecondInput.addEventListener('change', updateCountdownFromInputs);
    
    elements.workTime.addEventListener('change', updatePomodoroFromInputs);
    elements.breakTime.addEventListener('change', updatePomodoroFromInputs);
    elements.longBreakTime.addEventListener('change', updatePomodoroFromInputs);
}

// 标签页切换
function switchTab(tab) {
    activeTab = tab;
    
    // 更新导航按钮状态
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // 更新面板显示
    elements.tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tab);
    });
}

// 工具函数
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: secs.toString().padStart(2, '0')
    };
}

function formatMilliseconds(milliseconds) {
    const ms = Math.floor((milliseconds % 1000) / 10);
    return ms.toString().padStart(2, '0');
}

function showNotification(message, duration = 3000) {
    elements.notificationText.textContent = message;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, duration);
}

// 计时器功能 - 优化版本
function startTimer() {
    if (timerRunning) return;
    
    if (timerTime === 0) {
        updateTimerFromInputs();
    }
    
    if (timerTime === 0) {
        showNotification('请设置计时时间');
        return;
    }
    
    timerRunning = true;
    // 基于当前时间计算开始时间，确保后台运行准确
    timerStartTime = Date.now() - (timerTime * 1000);
    
    // 通知Web Worker开始计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'START_TIMER',
            data: { currentTime: timerTime }
        });
    }
    
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - timerStartTime) / 1000);
        timerTime = elapsed;
        updateTimerDisplay();
    }, TIMER_PRECISION);
    
    elements.startTimer.disabled = true;
    elements.pauseTimer.disabled = false;
    
    // 记录开始时间用于页面可见性处理
    pageVisibilityStart = Date.now();
}

function pauseTimer() {
    if (!timerRunning) return;
    
    timerRunning = false;
    clearInterval(timerInterval);
    timerPausedTime = timerTime;
    
    // 通知Web Worker暂停计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'PAUSE_TIMER'
        });
    }
    
    elements.startTimer.disabled = false;
    elements.pauseTimer.disabled = true;
}

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerTime = 0;
    timerPausedTime = 0;
    timerStartTime = 0;
    
    // 通知Web Worker重置计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'RESET_TIMER'
        });
    }
    
    updateTimerDisplay();
    
    elements.startTimer.disabled = false;
    elements.pauseTimer.disabled = true;
}

function updateTimerDisplay() {
    const time = formatTime(timerTime);
    elements.hours.textContent = time.hours;
    elements.minutes.textContent = time.minutes;
    elements.seconds.textContent = time.seconds;
}

function updateTimerFromInputs() {
    const hours = parseInt(elements.hourInput.value) || 0;
    const minutes = parseInt(elements.minuteInput.value) || 0;
    const seconds = parseInt(elements.secondInput.value) || 0;
    
    timerTime = hours * 3600 + minutes * 60 + seconds;
    updateTimerDisplay();
}

// 倒计时功能
function startCountdown() {
    if (countdownRunning) return;
    
    if (countdownTime === 0) {
        updateCountdownFromInputs();
    }
    
    if (countdownTime === 0) {
        showNotification('请设置倒计时时间');
        return;
    }
    
    countdownRunning = true;
    countdownStartTime = Date.now() - (countdownTotal - countdownTime) * 1000;
    
    // 通知Web Worker开始倒计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'START_COUNTDOWN',
            data: { currentTime: countdownTime, totalTime: countdownTotal }
        });
    }
    
    countdownInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
        countdownTime = Math.max(0, countdownTotal - elapsed);
        updateCountdownDisplay();
        
        if (countdownTime <= 0) {
            pauseCountdown();
            showNotification('倒计时结束！');
            playNotificationSound();
        }
    }, 1000);
    
    elements.startCountdown.disabled = true;
    elements.pauseCountdown.disabled = false;
}

function pauseCountdown() {
    if (!countdownRunning) return;
    
    countdownRunning = false;
    clearInterval(countdownInterval);
    countdownPausedTime = countdownTime;
    
    // 通知Web Worker暂停倒计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'PAUSE_COUNTDOWN'
        });
    }
    
    elements.startCountdown.disabled = false;
    elements.pauseCountdown.disabled = true;
}

function resetCountdown() {
    countdownRunning = false;
    clearInterval(countdownInterval);
    countdownTime = countdownTotal;
    countdownPausedTime = 0;
    countdownStartTime = 0;
    
    // 通知Web Worker重置倒计时
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'RESET_COUNTDOWN'
        });
    }
    
    updateCountdownDisplay();
    
    elements.startCountdown.disabled = false;
    elements.pauseCountdown.disabled = true;
}

function updateCountdownDisplay() {
    const time = formatTime(countdownTime);
    elements.countdownHours.textContent = time.hours;
    elements.countdownMinutes.textContent = time.minutes;
    elements.countdownSeconds.textContent = time.seconds;
}

function updateCountdownFromInputs() {
    const hours = parseInt(elements.countdownHourInput.value) || 0;
    const minutes = parseInt(elements.countdownMinuteInput.value) || 0;
    const seconds = parseInt(elements.countdownSecondInput.value) || 0;
    
    countdownTotal = hours * 3600 + minutes * 60 + seconds;
    countdownTime = countdownTotal;
    updateCountdownDisplay();
}

// 番茄钟功能
function startPomodoro() {
    if (pomodoroRunning) return;
    
    if (pomodoroTime === 0) {
        updatePomodoroFromInputs();
    }
    
    if (pomodoroTime === 0) {
        showNotification('请设置番茄钟时间');
        return;
    }
    
    pomodoroRunning = true;
    // 基于当前剩余时间计算开始时间，确保后台运行准确
    pomodoroStartTime = Date.now() - (pomodoroTotal - pomodoroTime) * 1000;
    
    // 通知Web Worker开始番茄钟
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'START_POMODORO',
            data: { currentTime: pomodoroTime, totalTime: pomodoroTotal }
        });
    }
    
    pomodoroInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - pomodoroStartTime) / 1000);
        pomodoroTime = Math.max(0, pomodoroTotal - elapsed);
        updatePomodoroDisplay();
        
        if (pomodoroTime <= 0) {
            pausePomodoro();
            handlePomodoroComplete();
        }
    }, 1000);
    
    elements.startPomodoro.disabled = true;
    elements.pausePomodoro.disabled = false;
}

function pausePomodoro() {
    if (!pomodoroRunning) return;
    
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    pomodoroPausedTime = pomodoroTime;
    
    // 通知Web Worker暂停番茄钟
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'PAUSE_POMODORO'
        });
    }
    
    elements.startPomodoro.disabled = false;
    elements.pausePomodoro.disabled = true;
}

function resetPomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    pomodoroPhase = 'work';
    pomodoroRound = 1;
    pomodoroPausedTime = 0;
    pomodoroStartTime = 0;
    
    // 通知Web Worker重置番茄钟
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'RESET_POMODORO'
        });
    }
    
    updatePomodoroFromInputs();
    updatePomodoroDisplay();
    
    elements.startPomodoro.disabled = false;
    elements.pausePomodoro.disabled = true;
}

function handlePomodoroComplete() {
    if (pomodoroPhase === 'work') {
        if (pomodoroRound % 4 === 0) {
            // 长休息
            pomodoroPhase = 'longBreak';
            const longBreakMinutes = parseInt(elements.longBreakTime.value) || 15;
            pomodoroTotal = longBreakMinutes * 60;
            pomodoroTime = pomodoroTotal;
            pomodoroStartTime = 0; // 重置开始时间
            pomodoroPausedTime = 0; // 重置暂停时间
            elements.pomodoroLabel.textContent = '长休息时间';
            showNotification('专注时间结束，开始长休息！');
        } else {
            // 短休息
            pomodoroPhase = 'break';
            const breakMinutes = parseInt(elements.breakTime.value) || 5;
            pomodoroTotal = breakMinutes * 60;
            pomodoroTime = pomodoroTotal;
            pomodoroStartTime = 0; // 重置开始时间
            pomodoroPausedTime = 0; // 重置暂停时间
            elements.pomodoroLabel.textContent = '休息时间';
            showNotification('专注时间结束，开始休息！');
        }
    } else {
        // 休息结束，开始下一轮工作
        pomodoroPhase = 'work';
        pomodoroRound++;
        const workMinutes = parseInt(elements.workTime.value) || 25;
        pomodoroTotal = workMinutes * 60;
        pomodoroTime = pomodoroTotal;
        pomodoroStartTime = 0; // 重置开始时间
        pomodoroPausedTime = 0; // 重置暂停时间
        elements.pomodoroLabel.textContent = '专注时间';
        showNotification('休息结束，开始新一轮专注！');
    }
    
    // 自动开始下一阶段
    pomodoroRunning = true;
    pomodoroStartTime = Date.now() - (pomodoroTotal - pomodoroTime) * 1000;
    pomodoroInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - pomodoroStartTime) / 1000);
        pomodoroTime = Math.max(0, pomodoroTotal - elapsed);
        updatePomodoroDisplay();
        
        if (pomodoroTime <= 0) {
            pausePomodoro();
            handlePomodoroComplete();
        }
    }, 1000);
    
    elements.startPomodoro.disabled = true;
    elements.pausePomodoro.disabled = false;
    
    updatePomodoroDisplay();
    playNotificationSound();
}

function updatePomodoroDisplay() {
    const time = formatTime(pomodoroTime);
    elements.pomodoroMinutes.textContent = time.minutes;
    elements.pomodoroSeconds.textContent = time.seconds;
    
    // 更新进度条
    const progress = pomodoroTotal > 0 ? ((pomodoroTotal - pomodoroTime) / pomodoroTotal) * 100 : 0;
    elements.pomodoroProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    
    // 更新进度文本
    const phaseText = pomodoroPhase === 'work' ? '专注' : pomodoroPhase === 'break' ? '休息' : '长休息';
    elements.pomodoroProgressText.textContent = `第 ${pomodoroRound} 轮 - ${phaseText}`;
    
    // 根据剩余时间改变进度条颜色
    if (progress > 80) {
        elements.pomodoroProgress.style.backgroundColor = 'var(--success-color)';
    } else if (progress > 50) {
        elements.pomodoroProgress.style.backgroundColor = 'var(--warning-color)';
    } else {
        elements.pomodoroProgress.style.backgroundColor = 'var(--danger-color)';
    }
}

function updatePomodoroFromInputs() {
    const workMinutes = parseInt(elements.workTime.value) || 25;
    pomodoroTotal = workMinutes * 60;
    pomodoroTime = pomodoroTotal;
    pomodoroPausedTime = 0;
    pomodoroStartTime = 0;
    updatePomodoroDisplay();
}

// 秒表功能
function initializeStopwatch() {
    // 确保秒表初始状态正确
    stopwatchRunning = false;
    stopwatchTime = 0;
    stopwatchStartTime = 0;
    stopwatchPausedTime = 0;
    lapTimes = [];
    
    // 设置按钮初始状态
    elements.startStopwatch.disabled = false;
    elements.pauseStopwatch.disabled = true;
    elements.lapStopwatch.disabled = true;
    
    // 更新显示
    updateStopwatchDisplay();
    updateLapList();
}

function startStopwatch() {
    if (stopwatchRunning) return;
    
    stopwatchRunning = true;
    // 基于当前时间计算开始时间，确保后台运行准确
    stopwatchStartTime = Date.now() - stopwatchTime;
    
    // 通知Web Worker开始秒表
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'START_STOPWATCH',
            data: { currentTime: stopwatchTime }
        });
    }
    
    stopwatchInterval = setInterval(() => {
        stopwatchTime = Date.now() - stopwatchStartTime;
        updateStopwatchDisplay();
    }, 16); // 约60fps更新频率，提供更流畅的显示
    
    elements.startStopwatch.disabled = true;
    elements.pauseStopwatch.disabled = false;
    elements.lapStopwatch.disabled = false;
}

function pauseStopwatch() {
    if (!stopwatchRunning) return;
    
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchPausedTime = stopwatchTime; // 保存暂停时的时间
    
    // 通知Web Worker暂停秒表
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'PAUSE_STOPWATCH'
        });
    }
    
    elements.startStopwatch.disabled = false;
    elements.pauseStopwatch.disabled = true;
    elements.lapStopwatch.disabled = true; // 暂停时禁用计圈按钮
}

function lapStopwatch() {
    if (!stopwatchRunning) return;
    
    const currentTime = stopwatchTime;
    const lapNumber = lapTimes.length + 1;
    
    // 计算圈间时间差
    let lapDuration = currentTime;
    if (lapTimes.length > 0) {
        lapDuration = currentTime - lapTimes[lapTimes.length - 1].time;
    }
    
    const lapTime = {
        number: lapNumber,
        time: currentTime,
        duration: lapDuration,
        display: formatStopwatchTime(currentTime),
        lapDisplay: formatStopwatchTime(lapDuration)
    };
    
    lapTimes.push(lapTime);
    updateLapList();
}

function resetStopwatch() {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    stopwatchStartTime = 0;
    stopwatchPausedTime = 0;
    lapTimes = [];
    
    // 通知Web Worker重置秒表
    if (timerWorker) {
        timerWorker.postMessage({
            type: 'RESET_STOPWATCH'
        });
    }
    
    updateStopwatchDisplay();
    updateLapList();
    
    elements.startStopwatch.disabled = false;
    elements.pauseStopwatch.disabled = true;
    elements.lapStopwatch.disabled = true;
}

function updateStopwatchDisplay() {
    const time = formatStopwatchTime(stopwatchTime);
    elements.stopwatchHours.textContent = time.hours;
    elements.stopwatchMinutes.textContent = time.minutes;
    elements.stopwatchSeconds.textContent = time.seconds;
    elements.stopwatchMilliseconds.textContent = time.milliseconds;
}

function formatStopwatchTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 显示到10毫秒精度
    
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: ms.toString().padStart(2, '0')
    };
}

function updateLapList() {
    elements.lapList.innerHTML = '';
    
    lapTimes.forEach((lap, index) => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        
        // 显示圈间时间和总时间
        const lapTimeText = index === 0 ? 
            `总时间: ${lap.display}` : 
            `圈间: ${lap.lapDisplay} | 总时间: ${lap.display}`;
        
        lapItem.innerHTML = `
            <span class="lap-number">第 ${lap.number} 圈</span>
            <span class="lap-time">${lapTimeText}</span>
        `;
        elements.lapList.appendChild(lapItem);
    });
}

// 通知声音
function playNotificationSound() {
    // 创建音频上下文播放提示音
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('无法播放提示音:', error);
    }
}

// 键盘快捷键
document.addEventListener('keydown', function(event) {
    if (event.target.tagName === 'INPUT') return;
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            if (activeTab === 'timer') {
                timerRunning ? pauseTimer() : startTimer();
            } else if (activeTab === 'countdown') {
                countdownRunning ? pauseCountdown() : startCountdown();
            } else if (activeTab === 'pomodoro') {
                pomodoroRunning ? pausePomodoro() : startPomodoro();
            } else if (activeTab === 'stopwatch') {
                stopwatchRunning ? pauseStopwatch() : startStopwatch();
            }
            break;
        case 'KeyR':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (activeTab === 'timer') resetTimer();
                else if (activeTab === 'countdown') resetCountdown();
                else if (activeTab === 'pomodoro') resetPomodoro();
                else if (activeTab === 'stopwatch') resetStopwatch();
            }
            break;
        case 'KeyL':
            if (activeTab === 'stopwatch' && stopwatchRunning) {
                event.preventDefault();
                lapStopwatch();
            }
            break;
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时保存当前时间戳，但不暂停计时器
        // 这样计时器可以在后台继续运行
        pageVisibilityStart = Date.now();
    } else {
        // 页面重新可见时，更新显示但不影响计时器运行
        // 计时器会继续在后台运行，只是更新显示
        if (timerRunning || countdownRunning || pomodoroRunning || stopwatchRunning) {
            // 立即更新一次显示
            updateAllDisplays();
        }
    }
});

// 更新所有显示的函数
function updateAllDisplays() {
    if (timerRunning) {
        updateTimerDisplay();
    }
    if (countdownRunning) {
        updateCountdownDisplay();
    }
    if (pomodoroRunning) {
        updatePomodoroDisplay();
    }
    if (stopwatchRunning) {
        updateStopwatchDisplay();
    }
}

// 收藏功能
function initBookmark() {
    if (!elements.bookmarkBtn) return;
    
    // 检查是否已收藏
    const isBookmarked = localStorage.getItem('bookmarked-index') === 'true';
    if (isBookmarked) {
        elements.bookmarkBtn.classList.add('bookmarked');
    }
    
    elements.bookmarkBtn.addEventListener('click', () => {
        const isCurrentlyBookmarked = elements.bookmarkBtn.classList.contains('bookmarked');
        
        if (isCurrentlyBookmarked) {
            elements.bookmarkBtn.classList.remove('bookmarked');
            localStorage.setItem('bookmarked-index', 'false');
        } else {
            elements.bookmarkBtn.classList.add('bookmarked');
            localStorage.setItem('bookmarked-index', 'true');
        }
    });
}

// 分享功能
function initShare() {
    if (!elements.shareBtn || !elements.sharePanel) return;
    
    elements.shareBtn.addEventListener('click', () => {
        elements.sharePanel.classList.toggle('show');
    });
    
    // 点击外部关闭分享面板
    document.addEventListener('click', (e) => {
        if (!elements.shareBtn.contains(e.target) && !elements.sharePanel.contains(e.target)) {
            elements.sharePanel.classList.remove('show');
        }
    });
    
    // 分享按钮功能
    const shareButtons = document.querySelectorAll('.share-button');
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const pageDescription = 'TimeMaster - 专业的在线倒计时器，支持自定义倒计时、番茄钟、秒表功能。免费使用，无需下载，支持移动端。';
    
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.getAttribute('data-platform');
            let shareUrl = '';
            
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
                    break;
                case 'reddit':
                    shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                elements.sharePanel.classList.remove('show');
            }
        });
    });
}

// 初始化收藏和分享功能
initBookmark();
initShare(); 