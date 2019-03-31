chrome.runtime.onInstalled.addListener(function() {
    
    let timer ;
    let focus = timer;
    let break_time ;
    let long_break_time ;
    let interval;
    let is_break = true;
    let break_time_count ;
    let count = 0;
    let api_token;

    
    chrome.runtime.onMessage.addListener(

        function(request, sender, sendResponse) {

            chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
                timer = result.pomodoro
                focus = timer;
            });
            chrome.storage.local.get({'short_br': 5 * 60}, function(result) {
              break_time = result.short_br
            });
            chrome.storage.local.get({'long_br': 15 * 60}, function(result) {
              long_break_time = result.long_br  
            });
            chrome.storage.local.get({'pomodoros': 4}, function(result) {
              break_time_count = result.pomodoros;
            });

            console.log("REQUEST " + request.timer_state);
            console.log("API TOKEN " + api_token);

            if (request.timer_state){
                interval = setInterval(function () {
                    timer--;
                    if (timer < 0) {
                        
                        if(is_break){
                            openPage();
                            count++;

                            if(count == break_time_count ){
                        
                                timer = long_break_time;
                                count = 0;
                               
                            }else{
                                timer = break_time;
                            }

                            is_break = false;
                        }else{
                            timer = focus;
                            is_break = true;
                        }
                            
                    }


                    chrome.storage.local.set({'pomodoro': timer}, function() {
                        // Notify that we saved.
                        console.log("SAVED " + timer)
                    });
                    
                }, 1000); 
            }else{
                    stopTimer();
                    
                }
        });
    

    function stopTimer() {
        clearInterval(interval);
        chrome.storage.local.set({'pomodoro': focus}, function() {

        });
        timer = focus;
    }
    function openPage() {

        chrome.tabs.create({'url': chrome.extension.getURL('break.html')}, function(tab) {
    
            console.log("TAB")
        });
    }
    
});




