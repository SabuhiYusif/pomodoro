let timerText = document.getElementById("timer");
let startBtn = document.getElementById("start_btn");
let stopBtn = document.getElementById("stop_btn");
let title = document.getElementById("title");
let togglSync = document.getElementById("toggl_sync");
let goalContainer = document.getElementById("goal_container");
let error = document.getElementById("error");
let goalInput = document.getElementById("goal");
let timer;
let apiToken;
var togglTimerId;
let duration;
let sync = false;

chrome.storage.local.get({'working': false}, function(result) {
	// If timer is in working state show relevant UI
	if(result.working){
		disableStartBtn();
		enableStopBtn();
		hideTogglLink();
		hideGoalContainer();
		// If goal specified then show it otherwise show default text
		chrome.storage.local.get({'goal': ""}, function(result) {
			if(result.goal){
				changeTitleText("Goal: " + result.goal);
			}else{
				changeTitleText("Stay focused!");
			}
		});
		
	}else{
		displayTogglLink();
		disableStoptBtn();
	}
});

// Update timer text according current pomodoro's value
chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
			  updateTimerText(result.pomodoro);
});

// Change toggl sync text according to whether it is synced or not
chrome.storage.local.get({'sync': false}, function(result) {
	sync = result.sync;
	if(sync){
		togglSync.textContent = "toggl unsync";
	}else{
		togglSync.textContent = "toggl sync";
	}
});

// Listen changes in timer from background
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		var storageChange = changes[key];
			if(key == "pomodoro"){
				updateTimerText(storageChange.newValue);
			}
	}
});

togglSync.onclick = function() {
	if(!sync){
		var http = new XMLHttpRequest();
		syncToggl(http);		
	}else{
		sync = false
		chrome.storage.local.set({'sync': sync}, function() {
		});
		togglSync.textContent = "toggl sync";
	}
}
 
stopBtn.onclick = function() {
	enableStartBtn();
	disableStoptBtn();
	displayTogglLink();
	stopTimer();
	changeTitleText("Start working!");
	showGoalContainer();

	chrome.storage.local.set({'working': false}, function() {
	});
	chrome.storage.local.get({'sync': false}, function(result) {
		sync = result.sync;
	});

	// Stop timer in toggl
	if(sync){
		var http = new XMLHttpRequest();
		chrome.storage.local.get({'toggl_timer_id': 0}, function(result) {
			togglTimerId = result.toggl_timer_id;
			stopTogglTimer(http, togglTimerId);
		});
	}
};

startBtn.onclick = function() {
		disableStartBtn()
		enableStopBtn()
		hideTogglLink();
		startTimer();
		hideGoalContainer();
		chrome.storage.local.get({'api_token': apiToken}, function(result) {
			apiToken = result.api_token;
		});
		chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
			duration = result.pomodoro;
		});
		chrome.storage.local.get({'sync': false}, function(result) {
			sync = result.sync;
		});

		let desc = "Stay focused!";
		
		// If goal is specified then show it otherwise show default text
		if(goalInput.value){
			desc = goalInput.value;
			chrome.storage.local.set({'goal': desc}, function() {
			});
			changeTitleText("Goal: " + desc);
		}else{
			title.textContent = desc;
		}
		chrome.storage.local.set({'working': true}, function() {
		});

		if(sync){
			var http = new XMLHttpRequest();
			startTogglTimeEntry(http, duration, desc);
	 }
};


/**
 * Starts toggl timee
 * @param {XMLHttpRequest} http 
 * @param {number value} duration 
 * @param {string description} desc 
 */
function startTogglTimeEntry(http, duration, desc){
			var url = 'https://www.toggl.com/api/v8/time_entries/start';
			var params = `{"time_entry":{"description":"${desc}","tags":["billed"],"duration":"${duration}","start":"2019-03-29T02:10:58.000Z", "created_with":"curl"}}`;
			http.open('POST', url, true);
			let encoded = btoa(apiToken +':api_token');
			http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');
			http.responseType = 'json';
			http.onreadystatechange = function() {
					if(http.readyState == 4 && http.status == 200) {
							togglTimerId = http.response.data.id;
							chrome.storage.local.set({'toggl_timer_id': togglTimerId}, function() {
							});
					}
			}
			http.send(params);
}

/**
 * Stops toggl timer
 * @param {XMLHttpRequest} http 
 * @param {number value} togglTimerId 
 */
function stopTogglTimer(http, togglTimerId){
	var url = `https://www.toggl.com/api/v8/time_entries/${togglTimerId}/stop`;
	http.open('PUT', url, true);
	let encoded = btoa(apiToken +':api_token');
	http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');
	http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
			}
	}
	http.send();
}

/**
 * Syncs with toggl api
 * @param {XMLHttpRequest} http 
 */
function syncToggl(http){
	http.open("GET", "https://www.toggl.com/api/v8/me", true);
	http.responseType = 'json';
	http.onreadystatechange = function () {
			if(http.readyState === 4 && http.status === 200) {
								error.style.display ="none";
								apiToken = http.response.data.api_token;
								chrome.storage.local.set({'api_token': apiToken}, function() {
								});
								sync = true
								chrome.storage.local.set({'sync': sync}, function() {
								});
								togglSync.textContent = "toggl unsync";
			}else{
				error.style.display ="block";
			}
	};
	http.send();
}

/**
 * Sends message to background js to stop timer
 */
function stopTimer(){
	chrome.runtime.sendMessage({timer_state: false}, function() {
	});
}

/**
 * Sends message to background js to start timer
 */
function startTimer(){ 
	chrome.runtime.sendMessage({timer_state: true}, function() {
	});
 }

 /**
	* Updates timer text
	* @param {string} text 
	*/
 function updateTimerText(text){
	timer = text;
	minutes = parseInt(timer / 60, 10)
	seconds = parseInt(timer % 60, 10);
	
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	timerText.textContent = minutes + ":" + seconds;
}

function enableStartBtn() {
	startBtn.disabled = false;
}

function disableStartBtn() {
	startBtn.disabled = true;
}
function enableStopBtn() {
	stopBtn.disabled = false;
}

function disableStoptBtn() {
	stopBtn.disabled = true;
}
function hideTogglLink() {
	togglSync.style.display = "none";
}
function displayTogglLink() {
	togglSync.style.display = "block";
}

function hideGoalContainer(){
	goalContainer.style.display = "none";
}
function showGoalContainer(){
	goalContainer.style.display = "block";
}
function changeTitleText(text){
	title.textContent = text;
}
