let timer_tag = document.getElementById("timer_h");
let start_btn = document.getElementById("start_btn");
let stop_btn = document.getElementById("stop_btn");
let title = document.getElementById("title");
let goal_container = document.getElementById("goal_container");
let is_break = false;
let is_working = false;
let timer = 60;

let is_timer_on = false;

chrome.storage.local.get({'working': false}, function(result) {
	if(result.working){
		disableStartBtn();
		goal_container.style.display = "none";

		if(document.getElementById("goal").value){
			title.textContent = "Goal: " + document.getElementById("goal").value;
		}else{
			title.textContent = "Stay focused!"
		}
		
	}else{

	}
});

chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
			 
				timer = result.pomodoro;
				minutes = parseInt(timer / 60, 10)
				seconds = parseInt(timer % 60, 10);
				
				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;

				timer_tag.textContent = minutes + ":" + seconds;
			});





chrome.storage.onChanged.addListener(function(changes, namespace) {

	for (var key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
								'Old value was "%s", new value is "%s".',
								key,
								namespace,
								storageChange.oldValue,
								storageChange.newValue);

			if(key == "pomodoro"){
				timer = storageChange.newValue;
				minutes = parseInt(timer / 60, 10)
				seconds = parseInt(timer % 60, 10);
				
				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;
			
				timer_tag.textContent = minutes + ":" + seconds;
			}

	}
});


function stopTimer(){
	chrome.runtime.sendMessage({timer_state: false}, function(response) {
		// console.log(response.farewell);
		return Promise.resolve("Dummy response to keep the console quiet");
	});
}

function startTimer(){ 

	chrome.runtime.sendMessage({timer_state: true}, function(response) {
		console.log("Message sent");
		return Promise.resolve("Dummy response to keep the console quiet");
	});

 }


 
stop_btn.onclick = function(element) {
	enableStartBtn();
	title.textContent = "Start working!"
	stopTimer();
	goal_container.style.display = "block";
	chrome.storage.local.set({'working': false}, function(result) {
				
	});

};


start_btn.onclick = function() {
		disableStartBtn()

			
		startTimer();
	
		goal_container.style.display = "none";

		if(document.getElementById("goal").value){
			title.textContent = "Goal: " + document.getElementById("goal").value;
		}else{
			title.textContent = "Stay focused!"
		}

		chrome.storage.local.set({'working': true}, function() {
			
		});
			
		
	};



























// chrome.storage.sync.get('color', function(data) {
// 	changeColor.style.backgroundColor = data.color;
// 	changeColor.setAttribute('value', data.color);
// });
// function countDown(){
// 	counter++;
// 	document.getElementById("timer_h").innerHTML = counter;
// }

// let interval;

// function startTimer(duration, display) {
// 		var timer = duration, minutes, seconds;
		
// 		minutes = parseInt(timer / 60, 10)
// 		seconds = parseInt(timer % 60, 10);
		
// 		minutes = minutes < 10 ? "0" + minutes : minutes;
// 		seconds = seconds < 10 ? "0" + seconds : seconds;

// 		display.textContent = minutes + ":" + seconds;

// 		if (--timer < 0) {
// 				timer = duration;
// 		}

		// interval = setInterval(function () {
		// 	chrome.storage.sync.set({'value': timer}, function() {
		// 		// Notify that we saved.
		// 		console.log("SAVED " + timer)
		// 	});
		// 	minutes = parseInt(timer / 60, 10)
		// 	seconds = parseInt(timer % 60, 10);
			
		// 	minutes = minutes < 10 ? "0" + minutes : minutes;
		// 	seconds = seconds < 10 ? "0" + seconds : seconds;
		
		// 	display.textContent = minutes + ":" + seconds;
		
		// 	if (--timer < 0) {
		// 		enableStartBtn();
		// 		if(is_break){
		// 			afterBreak();
		// 		}else{
		// 			afterPomodoro();
		// 		}
					
		// 	}
		// }, 1000);
	
// }

// function stopTimer() {
// 	enableStartBtn();
// 	clearInterval(interval);
// 	timer_tag.textContent =  focus + ":" + "00"
// }
// function afterPomodoro() {
// 	clearInterval(interval);
// 	showBreakTimeScreen();
// 	openPage();

// }
// function afterBreak() {
// 	clearInterval(interval);
// 	showPomodoroScreen();
// }

// function showPomodoroScreen() {
// 	is_break = false;
// 	title.innerHTML = "Break Time is Over <br> Back to work!";
// 	timer_tag.textContent =  focus + ":" + "00";;
// }

// function showBreakTimeScreen() {
// 	is_break = true;
// 	title.textContent = "Time to take a break!";
// 	timer_tag.textContent =  break_ + ":" + "00";
// }

function enableStartBtn() {
	start_btn.disabled = false;
}

function disableStartBtn() {
	start_btn.disabled = true;
}
// function openPage() {
// 	// chrome.tabs.create({'url': chrome.extension.getURL('break.html')}, function(tab) {
// 	// 	showBreakTimeScreen();
// 	// 	console.log("TAB")
// 	// });
// }

// start_btn.onclick = function(element) {
// 	disableStartBtn()
	
// 	if(is_break){
// 		count_breaks++;
// 		if(count_breaks === 4){
// 			startTimer(5 * 3, timer_tag);
// 			count_breaks = 0;
// 		}else{
// 			startTimer(2, timer_tag);
// 		}
// 		title.textContent = "Get Away From Computer Screen!"
// 	}else{
		
// 		chrome.storage.sync.get(['value'], function(result) {
// 			timer = result.value;
// 			console.log("DSADSD " + timer)
// 			if(timer === 0){
// 				startTimer(50, timer_tag);
// 			}else{
// 				startTimer(timer, timer_tag);
// 			}

// 		});
	
// 		title.textContent = "Stay focused!"
// 	}

// };

// stop_btn.onclick = function(element) {
// 	stop_btn.textContent = "Stop"
// 	title.textContent = "Start working!"
// 	stopTimer();
// 	enableStartBtn()
// };

