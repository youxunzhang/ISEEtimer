// Web Worker for background timer functionality
// 这个Worker确保计时器在页面后台时也能准确运行

let timerData = {
    timer: { running: false, startTime: 0, currentTime: 0 },
    countdown: { running: false, startTime: 0, totalTime: 0, currentTime: 0 },
    pomodoro: { running: false, startTime: 0, totalTime: 0, currentTime: 0 },
    stopwatch: { running: false, startTime: 0, currentTime: 0 }
};

// 监听主线程的消息
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    switch(type) {
        case 'START_TIMER':
            timerData.timer = {
                running: true,
                startTime: Date.now() - (data.currentTime * 1000),
                currentTime: data.currentTime
            };
            break;
            
        case 'START_COUNTDOWN':
            timerData.countdown = {
                running: true,
                startTime: Date.now() - (data.totalTime - data.currentTime) * 1000,
                totalTime: data.totalTime,
                currentTime: data.currentTime
            };
            break;
            
        case 'START_POMODORO':
            timerData.pomodoro = {
                running: true,
                startTime: Date.now() - (data.totalTime - data.currentTime) * 1000,
                totalTime: data.totalTime,
                currentTime: data.currentTime
            };
            break;
            
        case 'START_STOPWATCH':
            timerData.stopwatch = {
                running: true,
                startTime: Date.now() - data.currentTime,
                currentTime: data.currentTime
            };
            break;
            
        case 'PAUSE_TIMER':
            timerData.timer.running = false;
            break;
            
        case 'PAUSE_COUNTDOWN':
            timerData.countdown.running = false;
            break;
            
        case 'PAUSE_POMODORO':
            timerData.pomodoro.running = false;
            break;
            
        case 'PAUSE_STOPWATCH':
            timerData.stopwatch.running = false;
            break;
            
        case 'RESET_TIMER':
            timerData.timer = { running: false, startTime: 0, currentTime: 0 };
            break;
            
        case 'RESET_COUNTDOWN':
            timerData.countdown = { running: false, startTime: 0, totalTime: 0, currentTime: 0 };
            break;
            
        case 'RESET_POMODORO':
            timerData.pomodoro = { running: false, startTime: 0, totalTime: 0, currentTime: 0 };
            break;
            
        case 'RESET_STOPWATCH':
            timerData.stopwatch = { running: false, startTime: 0, currentTime: 0 };
            break;
            
        case 'GET_STATUS':
            // 计算当前时间
            const now = Date.now();
            
            if (timerData.timer.running) {
                timerData.timer.currentTime = Math.floor((now - timerData.timer.startTime) / 1000);
            }
            
            if (timerData.countdown.running) {
                const elapsed = Math.floor((now - timerData.countdown.startTime) / 1000);
                timerData.countdown.currentTime = Math.max(0, timerData.countdown.totalTime - elapsed);
            }
            
            if (timerData.pomodoro.running) {
                const elapsed = Math.floor((now - timerData.pomodoro.startTime) / 1000);
                timerData.pomodoro.currentTime = Math.max(0, timerData.pomodoro.totalTime - elapsed);
            }
            
            if (timerData.stopwatch.running) {
                timerData.stopwatch.currentTime = now - timerData.stopwatch.startTime;
            }
            
            self.postMessage({
                type: 'STATUS_UPDATE',
                data: timerData
            });
            break;
    }
});

// 定期发送状态更新
setInterval(() => {
    const now = Date.now();
    let hasUpdate = false;
    
    if (timerData.timer.running) {
        timerData.timer.currentTime = Math.floor((now - timerData.timer.startTime) / 1000);
        hasUpdate = true;
    }
    
    if (timerData.countdown.running) {
        const elapsed = Math.floor((now - timerData.countdown.startTime) / 1000);
        timerData.countdown.currentTime = Math.max(0, timerData.countdown.totalTime - elapsed);
        hasUpdate = true;
    }
    
    if (timerData.pomodoro.running) {
        const elapsed = Math.floor((now - timerData.pomodoro.startTime) / 1000);
        timerData.pomodoro.currentTime = Math.max(0, timerData.pomodoro.totalTime - elapsed);
        hasUpdate = true;
    }
    
    if (timerData.stopwatch.running) {
        timerData.stopwatch.currentTime = now - timerData.stopwatch.startTime;
        hasUpdate = true;
    }
    
    if (hasUpdate) {
        self.postMessage({
            type: 'STATUS_UPDATE',
            data: timerData
        });
    }
}, 1000); // 每秒更新一次

