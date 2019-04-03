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
			 
				timer = result.pomodoro ;
				minutes = parseInt(timer / 60, 10)
				seconds = parseInt(timer % 60, 10);
				
				minutes = minutes < 10 ? "0" + minutes : minutes;
				seconds = seconds < 10 ? "0" + seconds : seconds;

				timerText.textContent = minutes + ":" + seconds;
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
			
				timerText.textContent = minutes + ":" + seconds;
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

 togglSync.onclick = function() {
	console.log("HEY TOGGL");
	if(!sync){
		var http = new XMLHttpRequest();
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
									console.log(sync)
				}else{
					error.style.display ="block";
				}
		};
		http.send();
		
	}else{
		sync = false
		chrome.storage.local.set({'sync': sync}, function(result) {
		});
		togglSync.textContent = "toggl sync";
	}

}
 
stopBtn.onclick = function(element) {
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

		chrome.storage.local.get({'toggl_timer_id': 0}, function(result) {
			togglTimerId = result.toggl_timer_id;
			var http = new XMLHttpRequest();
			console.log("After GET TIMER ID " +togglTimerId)
			var url = `https://www.toggl.com/api/v8/time_entries/${togglTimerId}/stop`;
	
			http.open('PUT', url, true);
	
			let encoded = btoa(apiToken +':api_token');
			http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');
	
			http.onreadystatechange = function() {
					if(http.readyState == 4 && http.status == 200) {
							console.log("STOP " + http.response);
					}
			}
			
			http.send();
		});
	
	}
};


startBtn.onclick = function() {
		disableStartBtn()
		enableStopBtn()
		hideTogglLink();
		startTimer();
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
	
		hideGoalContainer();

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
			var url = 'https://www.toggl.com/api/v8/time_entries/start';

			var params = `{"time_entry":{"description":"${desc}","tags":["billed"],"duration":"${duration}","start":"2019-03-29T02:10:58.000Z", "created_with":"curl"}}`;
			console.log("PARAMSS  " + params);
			http.open('POST', url, true);

			// let encoded = btoa('dffdc920d5db30eb667568058da1a6c9:api_token')
			let encoded = btoa(apiToken +':api_token');
			http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');
			http.responseType = 'json';
			http.onreadystatechange = function() {
					if(http.readyState == 4 && http.status == 200) {
							console.log(http.response);
							togglTimerId = http.response.data.id;
							chrome.storage.local.set({'toggl_timer_id': togglTimerId}, function() {
								console.log("TIMER ID  " + togglTimerId);
							});
							

					}
			}
			
			http.send(params);
	 }
		
	};


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
