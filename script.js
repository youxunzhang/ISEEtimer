// 全局变量
let currentTheme = localStorage.getItem('theme') || 'light';
let activeTab = 'stopwatch';

// 计时器相关变量
let timerInterval = null;
let timerRunning = false;
let timerTime = 0;

// 倒计时相关变量
let countdownInterval = null;
let countdownRunning = false;
let countdownTime = 0;
let countdownTotal = 0;

// 番茄钟相关变量
let pomodoroInterval = null;
let pomodoroRunning = false;
let pomodoroTime = 0;
let pomodoroTotal = 0;
let pomodoroPhase = 'work'; // 'work', 'break', 'longBreak'
let pomodoroRound = 1;

// 秒表相关变量
let stopwatchInterval = null;
let stopwatchRunning = false;
let stopwatchTime = 0;
let stopwatchStartTime = 0;
let lapTimes = [];

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
    updateTimerDisplay();
    updateCountdownDisplay();
    updatePomodoroDisplay();
    updateStopwatchDisplay();
});

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

// 计时器功能
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
    timerInterval = setInterval(() => {
        timerTime++;
        updateTimerDisplay();
    }, 1000);
    
    elements.startTimer.disabled = true;
    elements.pauseTimer.disabled = false;
}

function pauseTimer() {
    if (!timerRunning) return;
    
    timerRunning = false;
    clearInterval(timerInterval);
    
    elements.startTimer.disabled = false;
    elements.pauseTimer.disabled = true;
}

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerTime = 0;
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
    countdownInterval = setInterval(() => {
        countdownTime--;
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
    
    elements.startCountdown.disabled = false;
    elements.pauseCountdown.disabled = true;
}

function resetCountdown() {
    countdownRunning = false;
    clearInterval(countdownInterval);
    countdownTime = countdownTotal;
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
    pomodoroInterval = setInterval(() => {
        pomodoroTime--;
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
    
    elements.startPomodoro.disabled = false;
    elements.pausePomodoro.disabled = true;
}

function resetPomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    pomodoroPhase = 'work';
    pomodoroRound = 1;
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
            elements.pomodoroLabel.textContent = '长休息时间';
            showNotification('专注时间结束，开始长休息！');
        } else {
            // 短休息
            pomodoroPhase = 'break';
            const breakMinutes = parseInt(elements.breakTime.value) || 5;
            pomodoroTotal = breakMinutes * 60;
            pomodoroTime = pomodoroTotal;
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
        elements.pomodoroLabel.textContent = '专注时间';
        showNotification('休息结束，开始新一轮专注！');
    }
    
    updatePomodoroDisplay();
    playNotificationSound();
}

function updatePomodoroDisplay() {
    const time = formatTime(pomodoroTime);
    elements.pomodoroMinutes.textContent = time.minutes;
    elements.pomodoroSeconds.textContent = time.seconds;
    
    // 更新进度条
    const progress = pomodoroTotal > 0 ? ((pomodoroTotal - pomodoroTime) / pomodoroTotal) * 100 : 0;
    elements.pomodoroProgress.style.width = `${progress}%`;
    
    // 更新进度文本
    const phaseText = pomodoroPhase === 'work' ? '专注' : pomodoroPhase === 'break' ? '休息' : '长休息';
    elements.pomodoroProgressText.textContent = `第 ${pomodoroRound} 轮 - ${phaseText}`;
}

function updatePomodoroFromInputs() {
    const workMinutes = parseInt(elements.workTime.value) || 25;
    pomodoroTotal = workMinutes * 60;
    pomodoroTime = pomodoroTotal;
    updatePomodoroDisplay();
}

// 秒表功能
function startStopwatch() {
    if (stopwatchRunning) return;
    
    stopwatchRunning = true;
    stopwatchStartTime = Date.now() - stopwatchTime;
    stopwatchInterval = setInterval(() => {
        stopwatchTime = Date.now() - stopwatchStartTime;
        updateStopwatchDisplay();
    }, 10);
    
    elements.startStopwatch.disabled = true;
    elements.pauseStopwatch.disabled = false;
    elements.lapStopwatch.disabled = false;
}

function pauseStopwatch() {
    if (!stopwatchRunning) return;
    
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    
    elements.startStopwatch.disabled = false;
    elements.pauseStopwatch.disabled = true;
}

function lapStopwatch() {
    if (!stopwatchRunning) return;
    
    const lapTime = {
        number: lapTimes.length + 1,
        time: stopwatchTime,
        display: formatStopwatchTime(stopwatchTime)
    };
    
    lapTimes.push(lapTime);
    updateLapList();
}

function resetStopwatch() {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    lapTimes = [];
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
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: ms.toString().padStart(2, '0')
    };
}

function updateLapList() {
    elements.lapList.innerHTML = '';
    
    lapTimes.forEach(lap => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">第 ${lap.number} 圈</span>
            <span class="lap-time">${lap.display}</span>
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
        // 页面隐藏时暂停所有计时器
        if (timerRunning) pauseTimer();
        if (countdownRunning) pauseCountdown();
        if (pomodoroRunning) pausePomodoro();
        if (stopwatchRunning) pauseStopwatch();
    }
});

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