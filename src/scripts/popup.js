'use strict'; 
/*global chrome, document, enabled */

const form = document.getElementsByTagName('form')[0];
const amountInput = document.querySelector('[id=amount]');
const amountLabel = document.querySelector('[for="amount"]');

const checkboxes = document.querySelectorAll('input[type="checkbox"]');

amountLabel.textContent = `Number of articles (${amountInput.value})`;

function updateRange(amount){
	amountLabel.textContent = `Number of articles (${amount})`;
}

function tickBox(box, isTicked){
	box.value = box.checked = (isTicked === 'true');
}

form.addEventListener('submit', function(e){

	e.preventDefault();

	const valueElements = Array.from(form.querySelectorAll('input:not([type="submit"]), select'));
	const s = {};

	valueElements.forEach(el => {
		s[el.id] = el.value;
	});

	console.log(s);

	chrome.runtime.sendMessage({method: 'saveFormData', data : s }, function(response) {
		console.log('PopupJS... Response to saveFormData:', response);
	});

}, false);

amountInput.addEventListener('input', function(){
	updateRange(this.value);
}, false);

Array.from(checkboxes).forEach(function(checkbox){
	console.log(checkbox);
	checkbox.addEventListener('click', function(){
		this.value = this.checked;
	}, false);
});

chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {
	console.log('PopupJS... Response to getFormData:', response);

	for(const key in response.data){
		console.log(key, response.data[key]);
		const el = document.getElementById(key);
		el.value = response.data[key];
		
		if(el.type === 'checkbox'){
			tickBox(el, response.data[key]);
		}

		if(key === 'amount'){
			updateRange(response.data[key]);
		}

		if(key === 'enabled'){
			updateEnabled(response.data[key]);
		}

	}

});