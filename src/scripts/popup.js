'use strict'; 
/*global chrome, document, justOnce, theme, size*/

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

size.addEventListener('mousedown', function(e){
	console.log(this.getAttribute('data-clickable'));
	if(this.getAttribute('data-clickable') === 'false'){
		e.preventDefault();
	}

}, false);

theme.addEventListener('change', function(){
	// console.log(this.value);
	if(this.value === 'none'){	
		size.setAttribute('data-clickable', 'false');
	} else {
		size.setAttribute('data-clickable', 'true');
	}

}, false);

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

Array.from(checkboxes).forEach(function(checkbox){
	console.log(checkbox);
	checkbox.addEventListener('click', function(){
		this.value = this.checked;
	}, false);
});

chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {
	console.log('PopupJS... Response to getFormData:', response);

	for (const key in response.data) {
		console.log(key, response.data[key]);
		const el = document.getElementById(key);
		el.value = response.data[key];
		
		if(el.type === 'checkbox'){
			tickBox(el, response.data[key]);
		}

		if(key === 'amount'){
			updateRange(response.data[key]);
		}

		if(key === 'theme' && response.data[key] === 'none'){
			size.setAttribute('data-clickable', 'false');
		}

	}
});
