const form = document.getElementsByTagName('form')[0];
const rssInput = document.querySelector('[id=rss]');
const amountInput = document.querySelector('[id=amount]');
const amountLabel = document.querySelector('[for="amount"]');

amountLabel.textContent = `Number of articles (${amountInput.value})`;

function updateRange(amount){
	amountLabel.textContent = `Number of articles (${amount})`;
}

function updateEnabled(isEnabled){
	enabled.value = enabled.checked = (isEnabled === "true");
}

form.addEventListener('submit', function(e){

	e.preventDefault();

	const valueElements = Array.from(form.querySelectorAll("input:not([type='submit']), select"));
	let s = {};

	valueElements.forEach(el => {
		s[el.id] = el.value;
	});

	console.log(s);

	chrome.runtime.sendMessage({method: "saveFormData", data : s }, function(response) {
		console.log("PopupJS... Response to saveFormData:", response);
	});

}, false);

amountInput.addEventListener('input', function(){
	updateRange(this.value);
}, false);

enabled.addEventListener('click', function(){

	this.value = this.checked;

}, false);

chrome.runtime.sendMessage({method: "getFormData"}, function(response) {
	console.log("PopupJS... Response to getFormData:", response);

	for(var key in response.data){
		console.log(key, response.data[key]);
		document.getElementById(key).value = response.data[key];
		
		if(key === "amount"){
			updateRange(response.data[key]);
		}

		if(key === "enabled"){
			updateEnabled(response.data[key]);
		}

	}

});