'use strict';
/*global chrome, localStorage*/

function emitMessage(method, data){

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {method, data});
	});

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('StorageJS... Message Recieved:', request);
    if (request.method === 'getFormData'){
		sendResponse({
			data: JSON.parse(localStorage.getItem('formData'))
		});
    } else if(request.method === 'saveFormData'){

    	if(request.data !== undefined){
	    	localStorage.setItem('formData', JSON.stringify(request.data));

	    	emitMessage('updateFormData', request.data);
	    	
    	}

    }
});