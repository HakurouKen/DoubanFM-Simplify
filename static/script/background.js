chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
	// desktop notification
	if(message.action === "notification"){
		var info = message.info;

		chrome.notifications.create("",{
				type : "basic",
				title: info.albumtitle,
				message: info.artist + ' - ' + info.title,
				iconUrl: info.picture
			},function(id){
				setTimeout(function(){
					chrome.notifications.clear(id,function(data){});
				},3000);
			}
		);

		chrome.notifications.onClicked.addListener(function(){
			window.open('http://music.douban.com' + info.album);
		});
	}

	// download song
	if(message.action === "download"){
		chrome.downloads.download({
				url : message.url,
				filename : message.name,
				conflictAction : "uniquify"
			},function(id){
			}
		);
	}
});