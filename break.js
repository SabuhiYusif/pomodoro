let timer_tag = document.getElementById("timer_h");
let img = document.getElementById("cat_img");
let break_time = 60 * 5;
let break_ = break_time / 60;

let xhr = new XMLHttpRequest();
	// xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
xhr.open("GET", "https://dog.ceo/api/breeds/image/random", true);
xhr.responseType = 'json';
xhr.onreadystatechange = function () {
	if(xhr.readyState === 4 && xhr.status === 200) {
		img.src =xhr.response.message;
	}
};
xhr.send();

img.onclick = function(){
	xhr.open("GET", "https://dog.ceo/api/breeds/image/random", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
			img.src =xhr.response.message;
		}
	};
	xhr.send();

}