window.channelBind = function($channelContainer,cid){
	var $channelLists = $channelContainer.find("ul.channel-list"),
		$channels = $channelContainer.find("ul.channel-list li.channel");

	$channelLists.delegate('li.channel', 'click', function(event) {
		$channels.removeClass('selected');
		$(this).addClass('selected');
	});

	$channels.filter("[data-cid=" + (cid||0) + "]").addClass('selected');

	// run once
	delete window.channelBind;
};