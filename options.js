let btn = document.getElementById("change_btn");
pomodoroSelector = document.getElementById("pomodoro_selector");
shortBreakTimeSelector = document.getElementById("short_break_time_selector");
longBreakTimeSelector = document.getElementById("long_break_time_selector");
pomodoros = document.getElementById("pomodoros");
let pomodoroSelectorValue;
let shortBreakTimeSelectorValue;
let longBreakTimeSelectorValue;
let pomodorosValue;
let defaultPomodoro = 25 * 60;
let defaultShortBreak = 5 * 60;
let defaultLongBreak = 15 * 60;
let defaultNumberOfPomodoros = 4;
let optionsArr = ["pomodoro_selector", "short_break_time_selector", "long_break_time_selector", "pomodoros"];

fillSelectors(optionsArr);

chrome.storage.local.get({'focus_time': defaultPomodoro}, function(result) {
	pomodoroSelector.value  = (parseInt(result.focus_time) / 60);
})
chrome.storage.local.get({'short_br': defaultShortBreak}, function(result) {
	shortBreakTimeSelector.value  = parseInt(result.short_br) / 60;
})
chrome.storage.local.get({'long_br': defaultLongBreak}, function(result) {
	longBreakTimeSelector.value  = parseInt(result.long_br) / 60;
})
chrome.storage.local.get({'pomodoros': defaultNumberOfPomodoros}, function(result) {
	pomodoros.value  = result.pomodoros;
})

btn.onclick = function() {
	pomodoroSelectorValue = pomodoroSelector.value;
	shortBreakTimeSelectorValue = shortBreakTimeSelector.value;
	longBreakTimeSelectorValue = longBreakTimeSelector.value;
	pomodorosValue = pomodoros.value;	
	chrome.storage.local.set({'pomodoro': pomodoroSelectorValue * 60 }, function() {
	})
	chrome.storage.local.set({'short_br': shortBreakTimeSelectorValue * 60 }, function() {
	})
	chrome.storage.local.set({'long_br': longBreakTimeSelectorValue * 60 }, function() {
	})
	chrome.storage.local.set({'pomodoros': pomodorosValue }, function() {
	})
	chrome.storage.local.set({'focus_time': pomodoroSelectorValue * 60 }, function() {
	});

	alert("Option settings changed");
};

/**
 * Fills selectors with number from 1 to 90
 * @param {arrayOfSelectorsId} arr 
 */
function fillSelectors(arr){
	for(var i=0; i<arr.length; i++){
		for(var j=1; j<=99; j++){
			var select = document.getElementById(arr[i]);
			var option = document.createElement("OPTION");
			if(select.options !== null){
				select.options.add(option);
				option.text = j;
				option.value = j;
			}
		}
	};
}

