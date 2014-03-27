(function(window,document,$,undefined){
	var $originPlayer = $("#radioplayer"),
		originPlayerHTML = $originPlayer.clone().wrap('<div></div>').parent().html(),
		$originPage = $("body").contents(),
		$player = $("#fm-player-container");

		$originPage.wrapAll('<div id="origin"></div>');

		var $wrapper = $("#origin").css("display","none");
		$originPlayer.html("");

	// channel init
	function initChannel($container,cid){
		$container = $container || $('body');
		var ck = Utils.getCookie("ck");
		
		if( ck ){
			$.get(chrome.extension.getURL("template/channel-template.js")).done(function(source){
				$.get("/j/fav_channels?ck="+ck).done(function(fav){
					//render
					var template = Handlebars.compile(source),
						channelData = {
							"channel_list" : [{
								"channels": [
									{
										"id" : "0",
										"name" : "我的私人兆赫",
									},{
										"id" : "-3",
										"name" : "我的红心兆赫"
									}
								]
							},{
								"title" : "我的收藏",
								"channels" : fav.channels
							}]
						};

					$container.append( template(channelData) );

					if( $container.find(".channel-list-container").height() > $container.height() ){	
						$container.jscrollbar({
							width: 5,
							color:'rgb(168,168,168)',
							opacity: 0.2,
							position:'inner',
							borderRadius: 2,
							mouseScrollDirection:'vertical'
						});
					}

					channelBind( $container.find(".channel-list-container") , cid );
				});
			});
		}
		return;
	}

	// player init
	function initPlayer($container){
		$container = $container || $('body');
		$.get(chrome.extension.getURL("template/player-template.js")).done(function(tmpl){
			$container.append(tmpl);
			window.player = Player("#fm-player-container");
			bindPlayer(player);
			$.get("/j/change_channel?fcid=undefined&tcid=" + 
					( $("#fm-html5 ul.channel-list li.channel.selected").data('cid') || 0 ) + 
					"&area=songchannel").done(
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
	}

	// change between original douban.fm and plugin
	function pageToogle(origin){
		if(origin){
			player.pause();
			$wrapper.fadeIn(2000);
			$player.fadeOut(2000);
			$originPlayer.html(originPlayerHTML);
		}else{
			$player.fadeIn(2000,function(){
				player.play();
			});
			$wrapper.fadeOut(2000);
			$originPlayer.html("");
		}
	}

	// frame init
	$.get(chrome.extension.getURL("template/frame-template.js")).done(function(html){
		$("body").append(html);
		$("body").fadeIn(2000);

		var FM = $("#fm-html5");

		initChannel( FM.find(".channel-bar") , 0 );
		initPlayer( FM.find(".fm-bar") );
	});

})(window,document,jQuery);
