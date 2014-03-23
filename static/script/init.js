(function(window,document,$,undefined){
	$('body').css("display","none");
	var $originPlayer = $("#radioplayer"),
		originPlayerHTML = $originPlayer.clone().wrap('<div></div>').parent().html(),
		$originPage = $("body").contents();

		$originPage.wrapAll('<div id="origin"></div>');

		var $wrapper = $("#origin").css("display","none");
		$originPlayer.html("");

	$.get(chrome.extension.getURL("player-template.js")).done(function(tmpl){
		$("body").append(tmpl);
		window.player = Player("#fm-player-container");
		btnBind(player);
		$("body").fadeIn(2000);
		$.get("http://douban.fm/j/change_channel?fcid=undefined&tcid=0&area=songchannel").done(
			function(){
				player.getNextSongList("n",function(info){
					player.initSong(info.song[0]);
					if(info.song[0].like){
						$("#fm-player-container a.btn.heart").addClass('hearted');
					}
				});
			}
		);
	});

	function pageToogle(origin){
		if(origin){
			player.pause();
			$wrapper.fadeIn(2000);
			$originPlayer.html(originPlayerHTML);
		}else{
			$wrapper.fadeOut(2000);
			$originPlayer.html("");
		}
	}
})(window,document,jQuery);