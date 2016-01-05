const form = document.getElementsByTagName('form')[0];
const rssInput = document.querySelector('[id=rss]');
const amountInput = document.querySelector('[id=amount]');
const amountLabel = document.querySelector('[for="amount"]');

amountLabel.textContent = `Number of articles (${amountInput.value})`;

form.addEventListener('submit', function(e){

	e.preventDefault();

	chrome.runtime.sendMessage({method: "saveFormData", data : { rss : rssInput.value, amount : amountInput.value} }, function(response) {
		console.log("PopupJS... Response to saveFormData:", response);
	});

}, false);

amountInput.oninput = function(e){
	amountLabel.textContent = `Number of articles (${this.value})`;
};

chrome.runtime.sendMessage({method: "getFormData"}, function(response) {
	console.log("PopupJS... Response to getFormData:", response);
	rssInput.value = response.data.rss;
	amountInput.value = response.data.amount;
});
