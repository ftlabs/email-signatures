'use strict';
/*global MutationObserver, document, chrome*/

// polyfill
require('whatwg-fetch');

function populateSignatures(force) {

	const querySelector = 'div[aria-label="Message Body"]' + (force === true ? '' : ':not([data-ftsig="1"])');
	const messageBodies = [...document.querySelectorAll(querySelector)];

	messageBodies
	.forEach(function (message) {

		// mark that this has a signature set
		message.dataset.ftsig = '1';

		const spinner = new Spinner(message);
		const signature = document.createElement('div');
		const oldSig = message.querySelector(':scope > div[href="http://ftsig"]');
		if (!oldSig) {
			message.appendChild(signature);
		}
		signature.setAttribute('href', 'http://ftsig');
		getPopupInfo()
		.then(data => {
			if (data && data.enabled === 'true') {
				console.log(data);
				spinner.showSpinner();
				return data;
			}
			throw Error('No information stored');
		})
		.then(data => fetch(`https://ftlabs-email-signatures-server.herokuapp.com/sig?url=${encodeURIComponent(data.rss)}&max=${data.amount || 1}&theme=${data.theme || 'pink'}`))
		.then(response => {
			if (!response.ok) throw Error('Response not an okay status code. Status: ' + response.status);
			return response.text();
		})
		.then(body => {
			if (oldSig) {
				message.insertBefore(signature, oldSig);
				message.removeChild(oldSig);
			}
			signature.appendChild(
				document.createRange().createContextualFragment(body)
			);
			spinner.removeSpinner();
		})
		.catch(e => {
			spinner.removeSpinner();
			try{
				message.removeChild(signature);			
			} catch(e){

			}
			throw e;
		});
	});

}

function clearSignatures(){

	const existingEmailSigs = Array.from(document.querySelectorAll('[href="http://ftsig"]'));

	console.log(existingEmailSigs);

	existingEmailSigs.forEach(signature => {
		signature.parentNode.removeChild(signature);
	});

}

const watcher = new MutationObserver(populateSignatures);

watcher.observe(document.body, {
	childList: true
});


function Spinner(el) {

	const spinner = document.createElement('span');
	spinner.classList.add = 'ftsig-spinner';
	spinner.style.color = 'white';
	spinner.innerText = 'Loading Signature...';

	let t = el;
	let header;

	while(t && t.parentNode && !(t.attributes.role && t.attributes.role.value === 'dialog')) {
		t = t.parentNode;
	}
	if (t) {

		// Find the first cell which is the header text
		header = t.querySelector('table td');
		return {
			showSpinner() {
				header.appendChild(spinner);
			},
			removeSpinner() {
				try{
					header.removeChild(spinner);
				} catch (e){

				}
			}
		}
	}
	return {
		showSpinner() {},
		removeSpinner() {},
	}
}

function getPopupInfo() {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {
			resolve(response.data);
		});
	});
}


chrome.runtime.onMessage.addListener(function(request) {
	if (request.method === 'updateFormData'){
		if(request.data.enabled === 'true'){
			populateSignatures(true);		
		} else {
			clearSignatures();
		}
	}
});

