'use strict';
/*global MutationObserver, document, chrome*/

// polyfill
require('whatwg-fetch');

const watcher = new MutationObserver(function () {

	const messageBodies = [...document.querySelectorAll('div[aria-label="Message Body"]:not([data-ftsig="1"])')];

	messageBodies
	.filter(message => !message.querySelector('div[href="http://ftsig"]'))
	.forEach(function (message) {
		const signature = document.createElement('div');
		message.appendChild(signature);
		signature.setAttribute('href', 'http://ftsig');
		getPopupInfo()
		.then(data => {
			console.log(data);
			console.log('https://ftlabs-email-signatures-server.herokuapp.com/sig?url=' + data.rss + "&max=" + data.amount);
			if (data) {
				return data;
			}
			throw Error('No information stored');
		})
		.then(data => fetch('https://ftlabs-email-signatures-server.herokuapp.com/sig?url=' + data.rss + "&max=" + data.amount))
		.then(response => response.text())
		.then(body => {
			signature.appendChild(
				document.createRange().createContextualFragment(body)
			);
		});
	});

});

watcher.observe(document.body, {
	childList: true
});

function getPopupInfo() {
	return new Promise(function (resolve) {
		chrome.runtime.sendMessage({method: 'getFormData'}, function(response) {
			resolve(response.data);
		});
	});
}


chrome.runtime.onMessage.addListener(function(request) {
	console.log('MainJS Handler:', request);
    if (request.method === 'updateFormData'){
		console.log('RSS Updated:', request.data);
    }
});

