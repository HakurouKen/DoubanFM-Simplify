var msg = {};

// desktop notification event listener , use a external variable msg to exchange data with "onMessage" listener
chrome.notifications.onClicked.addListener(function(id) {
	(msg.info || {}).album && window.open('http://music.douban.com' + msg.info.album);
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	// desktop notification
	window.msg = message;
	if (message.action === "notification") {
		var info = message.info;

		chrome.notifications.create("", {
			type: "basic",
			title: info.albumtitle,
			message: info.artist + ' - ' + info.title,
			iconUrl: info.picture
		}, function(nid) {
			setTimeout(function() {
				chrome.notifications.clear(nid, function(data) {});
			}, 3000);
		});
	}

	// download song
	if (message.action === "download") {
		chrome.downloads.download({
			url: message.url,
			filename: message.name,
			conflictAction: "uniquify"
		}, function(id) {});
	}
});