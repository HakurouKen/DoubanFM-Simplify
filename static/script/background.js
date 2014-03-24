chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
	if(message.action === "notification"){
		var info = message.info,
			notification;
		if(window.webkitNotifications){
			notification = window.webkitNotifications.createNotification(
				info.picture,
				info.albumtitle,
				info.artist + ' - ' + info.title
			);
			notification.show();
			console.log(notification)
			
			notification.onclick = function(){
				window.open('http://music.douban.com' + info.album);
			}
			setTimeout(function(){
				notification.cancel();
			},3000);
		}
	}
});