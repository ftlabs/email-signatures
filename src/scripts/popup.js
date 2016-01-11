'use strict'; 
/*global window, chrome, document, justOnce, copyToClipboard, cbData*/

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

copyToClipboard.addEventListener('click', function(e){

	e.preventDefault();

	if(this.getAttribute('data-clickable') === 'false'){
		return;
	}

	chrome.runtime.sendMessage({
		method: 'getClipboard',
		data: getData()
	});

	this.setAttribute('data-clickable', 'false');
	this.textContent = 'Getting data...';

}, false);

Array.from(checkboxes).forEach(function(checkbox){
	checkbox.addEventListener('click', function(){
		this.value = this.checked;
	}, false);
});

chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {

	for (const key in response.data) {

		const el = document.getElementById(key);
		el.value = response.data[key];
		
		if(el.type === 'checkbox'){
			tickBox(el, response.data[key]);
		}

		if(key === 'amount'){
			updateRange(response.data[key]);
		}

	}
});

chrome.runtime.onMessage.addListener(function(request) {

	if(request.method === 'returnClipboardHTML'){
		// Clipboard Data
		console.log(request.data);
		cbData.innerHTML = request.data;
		const range = document.createRange();  
		range.selectNode(cbData);
		window.getSelection().addRange(range);
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		copyToClipboard.textContent = "HTML copied to Clipboard";

		setTimeout(function(){
			copyToClipboard.setAttribute('data-clickable', 'true');
			copyToClipboard.textContent = "Copy HTML to Clipboard";
		}, 2500);

	}

});

