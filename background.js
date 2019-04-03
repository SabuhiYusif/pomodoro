chrome.runtime.onInstalled.addListener(function() {
    let timer;
    let focusTime;
    let breakTime;
    let longBreakTime;
    let interval;
    let isBreak = true;
    let totalNumberOfBreakTimes;
    let currentNumberOfBreakTimes = 0;
    let defaultPomodoro = 25 * 60;
    let defaultShortBreak = 5 * 60;
    let defaultLongBreak = 15 * 60;
    let defaultNumberOfPomodoros = 4;

    chrome.storage.local.set({'focus_time': defaultPomodoro}, function() {
    });

    /** 
     * Listen message from popup.js and start timer when start button clicked in popup
    */
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            // If there is not setted params then use default values
            // If there is then assign them from resul.{paramName}
            chrome.storage.local.get({'pomodoro': defaultPomodoro}, function(result) {
                timer = result.pomodoro;
                focusTime = timer;
            });
            chrome.storage.local.get({'short_br': defaultShortBreak}, function(result) {
                breakTime = result.short_br;
            });
            chrome.storage.local.get({'long_br': defaultLongBreak}, function(result) {
                longBreakTime = result.long_br;
            });
            chrome.storage.local.get({'pomodoros': defaultNumberOfPomodoros}, function(result) {
                totalNumberOfBreakTimes = result.pomodoros;
            });
            

            // Decrease current pomodoro {timer} every 1 second
            if (request.timer_state){
                interval = setInterval(function () {
                    timer--;
                    if (timer < 0) {

                        // Check if it is a break time 
                        if(isBreak){
                            openNewPage();
                            currentNumberOfBreakTimes++;
                            if(currentNumberOfBreakTimes == totalNumberOfBreakTimes ){                        
                                timer = longBreakTime;
                                currentNumberOfBreakTimes = 0;
                            }else{
                                timer = breakTime;
                            }
                            isBreak = false;
                        }else{
                            timer = focusTime;
                            isBreak = true;
                        }         
                    }

                    // Set pomodoro to current {timer} value to notify popup.js for showing the time in popup window
                    chrome.storage.local.set({'pomodoro': timer}, function() {
                    });
                    
                }, 1000); 
            }else{

                stopTimer();    
            }
        });
    
    /**
     * Stops setInterval method and assigns pomodoro {timer} back to {focusTime}
     */
    function stopTimer() {
        clearInterval(interval);
        chrome.storage.local.set({'pomodoro': focusTime}, function() {
            timer = focusTime;
        });
        
    }

    /**
     * Opens new page(tab) when it is break time
     */
    function openNewPage() {

        chrome.tabs.create({'url': chrome.extension.getURL('break.html')}, function(tab) {
        });
    }
    
});




