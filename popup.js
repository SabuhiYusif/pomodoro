let timer_tag = document.getElementById("timer_h");
let start_btn = document.getElementById("start_btn");
let stop_btn = document.getElementById("stop_btn");
let title = document.getElementById("title");
let toggl_sync = document.getElementById("toggl_sync");
let goal_container = document.getElementById("goal_container");
let error = document.getElementById("error");

let is_break = false;
let is_working = false;
let timer = 60;

let is_timer_on = false;
let api_token;
let toggl_timer_id;
let duration;
let sync = false;


chrome.storage.local.get({'working': false}, function(result) {
	if(result.working){
		disableStartBtn();
		hideTogglLink();
		goal_container.style.display = "none";

		if(document.getElementById("goal").value){
			title.textContent = "Goal: " + document.getElementById("goal").value;
		}else{
			title.textContent = "Stay focused!"
		}
		
	}else{
		displayTogglLink();
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

chrome.storage.local.get({'sync': false}, function(result) {
	sync = result.sync;
	if(sync){
		toggl_sync.textContent = "toggl_unsync";
	}else{
		toggl_sync.textContent = "toggl_sync";
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

toggl_sync.onclick = function() {
	console.log("HEY TOGGL");
	if(!sync){
		var http = new XMLHttpRequest();
		http.open("GET", "https://www.toggl.com/api/v8/me", true);
		http.responseType = 'json';
		http.onreadystatechange = function () {
				if(http.readyState === 4 && http.status === 200) {
									error.style.display ="none";
									api_token = http.response.data.api_token;
									chrome.storage.local.set({'api_token': api_token}, function() {

									});
									sync = true
									chrome.storage.local.set({'sync': sync}, function() {
										
									});
									toggl_sync.textContent = "toggl_unsync";
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
		toggl_sync.textContent = "toggl_sync";
	}

}
 
stop_btn.onclick = function(element) {
	enableStartBtn();
	displayTogglLink();
	stopTimer();
	title.textContent = "Start working!"
	goal_container.style.display = "block";
	chrome.storage.local.set({'working': false}, function(result) {
				
	});
	chrome.storage.local.get({'sync': false}, function(result) {
		sync = result.sync;
	});

	if(sync){

		chrome.storage.local.get({'toggl_timer_id': 0}, function() {
			toggl_timer_id = result.toggl_timer_id;
		});
		var http = new XMLHttpRequest();
		var url = `https://www.toggl.com/api/v8/time_entries/${toggl_timer_id}/stop`;

		// var params = `{"time_entry":{"description":"${desc}","tags":["billed"],"duration":1200,"start":"2019-03-29T02:10:58.000Z", "created_with":"curl"}}`;
		http.open('PUT', url, true);

		// let encoded = btoa('dffdc920d5db30eb667568058da1a6c9:api_token')
		let encoded = btoa(api_token +':api_token');
		http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');

		http.onreadystatechange = function() {
				if(http.readyState == 4 && http.status == 200) {
						console.log("STOP " + http.response);
				}
		}
		
		http.send();
	}
};


start_btn.onclick = function() {
		disableStartBtn()
		hideTogglLink();
		startTimer();
		chrome.storage.local.get({'api_token': api_token}, function(result) {
			api_token = result.api_token;
		});
		chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
			duration = result.pomodoro;
		});
		chrome.storage.local.get({'sync': false}, function(result) {
			sync = result.sync;
		});

		let desc = "Stay focused!";
	
		goal_container.style.display = "none";

		if(document.getElementById("goal").value){
			desc = document.getElementById("goal").value;
			title.textContent = "Goal: " + desc;
			
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
			let encoded = btoa(api_token +':api_token');
			http.setRequestHeader('Authorization', encoded, 'Content-type', 'application/json');
			http.responseType = 'json';
			http.onreadystatechange = function() {
					if(http.readyState == 4 && http.status == 200) {
							console.log(http.response);
							toggl_timer_id = http.response.data.id;
							chrome.storage.local.set({'toggl_timer_id': toggl_timer_id}, function() {
			
							});
							console.log("TIMER ID  " + toggl_timer_id);

					}
			}
			
			http.send(params);
	 }
		
	};


function enableStartBtn() {
	start_btn.disabled = false;
}

function disableStartBtn() {
	start_btn.disabled = true;
}

function hideTogglLink() {
	toggl_sync.style.display = "none";
}
function displayTogglLink() {
	toggl_sync.style.display = "block";
}
