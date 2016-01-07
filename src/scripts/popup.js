'use strict'; 
/*global chrome, document, enabled */

const form = document.getElementsByTagName('form')[0];
const amountInput = document.querySelector('[id=amount]');
const amountLabel = document.querySelector('[for="amount"]');

amountLabel.textContent = `Number of articles (${amountInput.value})`;

function updateRange(amount){
	amountLabel.textContent = `Number of articles (${amount})`;
}

function updateEnabled(isEnabled){
	enabled.value = enabled.checked = (isEnabled === 'true');
}

function getData() {

	const valueElements = Array.from(form.querySelectorAll('input:not([type="submit"]), select'));
	const data = {};

	valueElements.forEach(el => {
		data[el.id] = el.value;
	});

	return data;
}

justOnce.addEventListener('click', function (e) {
	
	e.preventDefault();
	const data = getData();
	data.enabled = 'true';

	chrome.runtime.sendMessage({
		method: 'updateWithoutSaving',
		data
	});
});

form.addEventListener('submit', function(e) {
	
	e.preventDefault();
	chrome.runtime.sendMessage({
		method: 'saveFormData',
		data: getData()
	});
}, false);

amountInput.addEventListener('input', function(){
	updateRange(this.value);
}, false);

enabled.addEventListener('click', function(){

	this.value = this.checked;

}, false);

chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {
	console.log('PopupJS... Response to getFormData:', response);

	for (const key in response.data) {
		console.log(key, response.data[key]);
		document.getElementById(key).value = response.data[key];
		
		if(key === 'amount'){
			updateRange(response.data[key]);
		}

		if(key === 'enabled'){
			updateEnabled(response.data[key]);
		}

	}
});
