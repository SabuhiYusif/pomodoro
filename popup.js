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
	if(result.working){
		disableStartBtn();
		enableStopBtn();
		hideTogglLink();
		hideGoalContainer();

		if(goalInput.value){
			changeTitleText("Goal: " + goalInput.value);
		}else{
			changeTitleText("Stay focused!");
		}
	}else{
		displayTogglLink();
		disableStoptBtn();
	}
});

chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
			  changeTimerText(result.pomodoro);
			});

chrome.storage.local.get({'sync': false}, function(result) {
	sync = result.sync;
	if(sync){
		togglSync.textContent = "toggl unsync";
	}else{
		togglSync.textContent = "toggl sync";
	}
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		var storageChange = changes[key];
			if(key == "pomodoro"){
				changeTimerText(storageChange.newValue);
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
		if(goalInput.value){
			desc = goalInput.value;
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

function stopTimer(){
	chrome.runtime.sendMessage({timer_state: false}, function() {
		return Promise.resolve("Dummy response to keep the console quiet");
	});
}

function startTimer(){ 
	chrome.runtime.sendMessage({timer_state: true}, function() {
		return Promise.resolve("Dummy response to keep the console quiet");
	});
 }

 function changeTimerText(text){
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
