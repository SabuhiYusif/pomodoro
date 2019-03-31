let pomodor = document.getElementById('pomodoro');
let btn = document.getElementById("change_btn");
let pomodoro_selector;
let short_break_time_selector;
let long_break_time_selector;
let pomodoros;

let timer = 20;
let options_arr = ["pomodoro_selector", "short_break_time_selector", "long_break_time_selector", "pomodoros"]
for(var i=0; i<options_arr.length; i++){
	for(var j=1; j<=99; j++){
		var select = document.getElementById(options_arr[i]);
		var option = document.createElement("OPTION");
		if(select.options !== null){
			select.options.add(option);
			option.text = j;
			option.value = j;
		}
		
		
	}
};
chrome.storage.local.get({'pomodoro': 25 * 60}, function(result) {
	pomodoro_selector = document.getElementById("pomodoro_selector");

	pomodoro_selector.value  = result.pomodoro;
	
})
chrome.storage.local.get({'short_br': 5 * 60}, function(result) {
	short_break_time_selector = document.getElementById("short_break_time_selector");

	short_break_time_selector.value  = result.short_br;
})

chrome.storage.local.get({'long_br': 15 * 60}, function(result) {
	long_break_time_selector = document.getElementById("long_break_time_selector");

	long_break_time_selector.value  = result.long_br;
})
chrome.storage.local.get({'pomodoros': 4 * 60}, function(result) {
	pomodoros = document.getElementById("pomodoros");

	pomodoros.value  = result.pomodoros;
})



console.log("DSDAS");
// let pomodoro_selector, short_break_time_selector, long_break_time_selector, pomodoros;
btn.onclick = function(element) {
	console.log("DSAD")
	pomodoro_selector = document.getElementById("pomodoro_selector").value;
	short_break_time_selector = document.getElementById("short_break_time_selector").value;
	long_break_time_selector = document.getElementById("long_break_time_selector").value;
	pomodoros = document.getElementById("pomodoros").value;	

	// console.log(" " + pomodoro_selector +" "+ short_break_time_selector +" "+ long_break_time_selector +" "+ pomodoros + "  " );
	chrome.storage.local.set({'pomodoro': pomodoro_selector * 60}, function() {
	})
	chrome.storage.local.set({'short_br': short_break_time_selector  * 60}, function() {
	})
	chrome.storage.local.set({'long_br': long_break_time_selector  * 60}, function() {
	})
	chrome.storage.local.set({'pomodoros': pomodoros  * 60}, function() {
	})
};


