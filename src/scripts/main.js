'use strict';
/*global MutationObserver, document, chrome*/

// polyfill
require('whatwg-fetch');

const watcher = new MutationObserver(function () {

	const messageBodies = [...document.querySelectorAll('div[aria-label="Message Body"]:not([data-ftsig="1"])')];

	messageBodies
	.forEach(function (message) {
		const oldSig = message.querySelector('div[href="http://ftsig"]');
		if (oldSig) {
			oldSig.parentNode.removeChild(oldSig);
		}
		message.dataset.ftsig = "1";
		const signature = document.createElement('div');
		message.appendChild(signature);
		signature.setAttribute('href', 'http://ftsig');
		getRSS()
		.then(url => {
			if (url) {
				return url;
			}
			throw Error('No url defined');
		})
		.then(url => fetch('https://ftlabs-email-signatures-server.herokuapp.com/sig?url=' + url))
		.then(response => {
			if (!response.ok) throw Error('Response not an okay status code. Status: ' + response.status);
			return response.text();
		})
		.then(body => {
			signature.appendChild(
				document.createRange().createContextualFragment(body)
			);
		})
		.catch(e => {
			message.removeChild(signature);
			throw e;
		});
	});

});

watcher.observe(document.body, {
	childList: true
});

function getRSS() {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({method: 'getRSSLink'}, function(response) {
			resolve(response.data);
		});
	});
}


chrome.runtime.onMessage.addListener(function(request) {
	console.log('MainJS Handler:', request);
    if (request.method === 'updateRSSLink'){
		console.log('RSS Updated:', request.data);
    }
});

