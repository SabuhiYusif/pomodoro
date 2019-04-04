let img = document.getElementById("dog_img");
let url = "https://dog.ceo/api/breeds/image/random";
let xhr = new XMLHttpRequest();

getDogImage(xhr);

img.onclick = function(){
	getDogImage(xhr)
}

/**
 * Gets new dog image in each call
 * @param {XMLHttpRequest} http 
 */
function getDogImage(http){
	http.open("GET", url, true);
	http.responseType = 'json';
	http.onreadystatechange = function () {
		if(http.readyState === 4 && http.status === 200) {
			img.src =http.response.message;
		}
	};
	http.send();
}
