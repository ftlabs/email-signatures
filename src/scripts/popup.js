const form = document.getElementsByTagName('form')[0];
const rssInput = document.querySelector('[id=rss]');

form.addEventListener('submit', function(e){

	e.preventDefault();
	console.log("SAVE");

	chrome.runtime.sendMessage({method: "saveRSSLink", data : rssInput.value}, function(response) {
		console.log("PopupJS... Response to saveRSSLink:", response);
	});

}, false);

chrome.runtime.sendMessage({method: "getRSSLink"}, function(response) {
	console.log("PopupJS... Response to getRSSLink:", response);
	rssInput.value = response.data;
});
