const watcher = new MutationObserver(function () {

	const messageBodies = [...document.querySelectorAll('div[aria-label="Message Body"]:not([data-ftsig="1"])')];

	messageBodies
	.filter(message => !message.querySelector('span.data-ftsig-content'))
	.forEach(function (message) {
		const signature = document.createElement('div');
		signature.classList.add('data-ftsig-content');
		signature.appendChild(
			document.createRange().createContextualFragment('<hr /><a href="http://ada.is/">ADA!!</a>')
		);
		message.appendChild(signature);
	});

});


watcher.observe(document.body, {
	childList: true
});
