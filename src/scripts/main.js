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
		const parent = findParentElementByAttribute(message, 'role', 'dialog');

		// If we're in a compose window, our message dialog has a parent with role="dialog" on the element
		// The response dialogs in GMail do not have this parent with this attribute
		// This weirdness is due to GMails obfuscated DOM-naming conventions
		// We return false instead of throwing an error so we can still iterate through other elements
		// the may be dialogs and treat them appropriately

		if (parent === null) {
			const containingElement = findParentElementByAttribute(message, 'class', 'iN');
			if (!containingElement) {
				return false;
			}

			const sigTarget = containingElement.querySelector('.editable[aria-label="Message Body"]');
			const addAnywayApendee = containingElement.querySelector('.gU.OoRYyc:not([data-sig-pone-assigned="true"])');

			if (addAnywayApendee === null || sigTarget === null) {
				return false;
			}

			const pOne = document.createElement('span');
			pOne.textContent = 'Add RSS signature';
			pOne.setAttribute('style', 'font-size: 0.5em; cursor: pointer; float: left; position: absolute; top: 0; height: 100%; display: flex; align-items: center;');
			pOne.addEventListener('click', function(){
				this.style.opacity = 0.4;
				this.textContent = 'Getting signature...';

				getPopupInfo()
				.then(data => getRSSHTML(data))
				.then(body => {

					// Remove any old signatures
					const oldSigs = [...containingElement.querySelectorAll('div[href="http://ftsig"]')];
					oldSigs.forEach(oldSig => oldSig.parentNode.removeChild(oldSig));

					const signature = document.createElement('div');
					signature.setAttribute('href', 'http://ftsig');
					signature.innerHTML = body;
					sigTarget.insertBefore(signature, sigTarget.querySelector('.gmail_extra'));

					this.style.opacity = 1;
					this.textContent = 'Refresh RSS signature';

					//insert before .gmail_extra

				}, function () {
					this.style.opacity = 1;
					this.textContent = 'Refresh RSS signature';
				});

			}, false);

			addAnywayApendee.appendChild(pOne);
			addAnywayApendee.setAttribute('data-sig-pone-assigned', 'true');

			return false;
		
		}
		
		// mark that this has a signature set
		message.dataset.ftsig = '1';

		const spinner = new Spinner(message);

		const oldSigs = [...message.querySelectorAll('div[href="http://ftsig"]')];
		const topLevelSig = message.querySelector(':scope > div[href="http://ftsig"]');
		
		const signature = document.createElement('div');
		signature.setAttribute('href', 'http://ftsig');
		message.appendChild(signature);
		
		Promise.resolve(data || getPopupInfo())
		.then(data => {

			if (data) {
				if (data.enabled !== 'true') {

					// Remove all of the old signatures
					oldSigs.forEach(oldSig => oldSig.parentNode.removeChild(oldSig));
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
			if (topLevelSig) {
				message.insertBefore(signature, topLevelSig);
			} else {
				message.insertBefore(signature, message.querySelector('.gmail_extra'));
			}
			signature.innerHTML = body;
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
			oldSigs.forEach(oldSig => oldSig.parentNode.removeChild(oldSig));
		});
	});
}

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

const watcher = new MutationObserver(() => populateSignatures());

watcher.observe(document.body, {
	childList: true
});

// Check for and create default values 

getPopupInfo()
	.then(data => {
		console.log(data);
		if(data === null){

			chrome.runtime.sendMessage({
				method: 'saveFormData',
				data: {
					'amount': '3',
					'enabled': 'true',
					'include-author': 'true',
					'include-description': 'true',
					'include-heading': 'true',
					'include-humanDate': 'true',
					'include-link': 'true',
					'include-title': 'true',
					'rss': 'http://www.ft.com/rss/home/uk',
					'size': 'full',
					'theme': 'pink'
				}
			});

		}
	})
;
