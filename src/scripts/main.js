'use strict';
/*global MutationObserver, document, chrome*/

// polyfill
require('whatwg-fetch');

function findParentElementByAttribute(el, attr, value){

	while ((el = el.parentElement) && el.getAttribute(attr) !== value);
	return el;
}

function getRSSHTML(data){

	return new Promise(function(resolve, reject){

			console.log(data);

			if (data) {
			
				const ommissions = [];

				for(const key in data){
					
					if(key.indexOf('include-') > -1 && data[key] === 'false'){
						ommissions.push(key.replace('include-', ''));
					}

				}

				 resolve(`https://ftlabs-email-signatures-server.herokuapp.com/sig?url=${encodeURIComponent(data.rss)}&max=${data.amount || 1}&theme=${data.theme || 'pink'}&omit=${ommissions.join(",")}&size=${data.size}`);

			} else {
				reject("No data was passed");
			}

		})
		.then(url => fetch(url))
		.then(response => {
			if (!response.ok) throw Error('Response not an okay status code. Status: ' + response.status);
			return response.text();
		})
	;

}

function populateSignatures(data, force) {

	const querySelector = 'div[aria-label="Message Body"]' + (force === true ? '' : ':not([data-ftsig="1"])');
	const messageBodies = [...document.querySelectorAll(querySelector)];

	messageBodies
	.forEach(function (message) {
		var parent = findParentElementByAttribute(message, 'role', 'dialog');
		console.log(parent);
		if(parent === null){
			throw Error("Message is in a reply thread");
		}
		// mark that this has a signature set
		message.dataset.ftsig = '1';

		const spinner = new Spinner(message);
		const signature = document.createElement('div');
		const oldSig = message.querySelector(':scope > div[href="http://ftsig"]');
		if (!oldSig) {
			message.appendChild(signature);
		}
		signature.setAttribute('href', 'http://ftsig');
		
		Promise.resolve(data || getPopupInfo())
		.then(data => {

			if (data) {
				if (data.enabled !== 'true') {

					if (oldSig) message.removeChild(oldSig);
					throw Error('Extension Disabled');
				}
				spinner.showSpinner();

				return data;
			} else {
				throw Error('No information stored');
			}
		})
		.then(data => getRSSHTML(data))
		.then(body => {
			if (oldSig) {
				message.insertBefore(signature, oldSig);
			}
			signature.appendChild(
				document.createRange().createContextualFragment(body)
			);
			spinner.removeSpinner();
		})
		.catch(e => {
			console.log(e);
			spinner.removeSpinner();
			try{
				message.removeChild(signature);
			} catch(e) {}
			throw e;
		})
		.then(() => {
			if (oldSig) {
				try {
					message.removeChild(oldSig);
				} catch (e) {}
			}
		});
	});
}

const watcher = new MutationObserver(() => populateSignatures());

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

		populateSignatures(request.data, true);

	}

	if(request.method === 'getClipboard'){
		getRSSHTML(request.data)
			.then(result => {
				chrome.runtime.sendMessage({method: 'returnClipboardHTML', data : result});
			})
		;
	}

});

