chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("StorageJS... Message Recieved:", request);
    if (request.method === "getRSSLink"){
		sendResponse({
			data: localStorage.getItem('rssLink')
		});
    } else if(request.method === "saveRSSLink"){

    	if(request.data !== undefined){
	    	localStorage.setItem('rssLink', request.data);
	    	/*chrome.runtime.sendMessage({method: "updateRSSLink", data : request.data}, function(response){
	    		//
	    	});*/

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			    chrome.tabs.sendMessage(tabs[0].id, {method: "updateRSSLink", data: request.data}, function(response) {});  
			});
    	}

    }
});