(function(window,document,$,undefined){
	var $body = $('body'),
		$originPlayer = $("#radioplayer"),
		$originPage = $("body").contents(),
		$FM,
		$wrapper;

	window.isOrginal;

	// channel init
	function initChannel($container,player,cid){
		$container = $container || $('body');
		cid = cid || 0 ;
		var ck = Utils.getCookie("ck"),
			channel;
		
		if( ck ){
			return $.get(chrome.extension.getURL("template/channel-template.js")).done(function(source){
				$.when(
					$.get("/j/fav_channels?ck="+ck)				
				).done(function(fav){
					//render
					var $channelListContainer,
						template = Handlebars.compile(source),
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
								],
								"area": "system_chls"
							},{
								"title" : "我的收藏",
								"channels" : fav.channels,
								"area": "fav_chls"
							}]
						};

					$container.append( template(channelData) );
					$channelListContainer = $container.find(".channel-list-container");

					if( $channelListContainer.height() > $container.height() ){	
						$container.jscrollbar({
							width: 5,
							color:'rgb(168,168,168)',
							opacity: 0.2,
							position:'inner',
							borderRadius: 2,
							mouseScrollDirection:'vertical'
						});
					}

					window.channel = channel = Channel( $channelListContainer , player , cid );
					bindChannel( $channelListContainer , channel , player ,cid );
				});
			});
		}
		return;
	}

	// player init
	function initPlayer($container){
		$container = $container || $('body');
		return $.get(chrome.extension.getURL("template/player-template.js")).done(function(tmpl){
			$container.append(tmpl);
			window.player = Player("#fm-player-container");
			bindPlayer(player);

			// get the first song list
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

	// frame init
	function initFrame(){
		$originPage.wrapAll('<div id="origin"></div>');

		$wrapper = $("#origin").fadeOut(1000,function(){
			isOrginal = false;
		});
		$originPlayer.html("");

		return 	$.get(chrome.extension.getURL("template/frame-template.js")).done(function(html){
			$body.append(html);
			$FM = $("#fm-html5").css('display','none');
		});
	}

	// toggle button init
	function initToggleBtn(){
		return $.get(chrome.extension.getURL("template/button-template.js")).done(
			function(html){
				$body.append(html);

				bindToggleBtn('#toggleView',$FM,$wrapper,$originPlayer);
			}
		);
	}

	// lyric init
	function initLyric($container,player){
		$container = $container || $('body');
		return $.get(chrome.extension.getURL("template/lyric-template.js")).done(
			function(html){
				$container.append(html);
			var $player = $FM.find('#fm-player-container'),
				remain = $container.height() - $player.height() 
						- parseInt($player.css('margin-top')) - parseInt($player.css('margin-bottom')),
				$lyricDom = $FM.find('.lyric-container');
				$lyricDom.height(remain-30);
				$lyricDom.find('.lyric-wrapper').height(remain-30-50);
			}
		);
	}

	function init(){
		initFrame().then(function(){
			initPlayer( $FM.find(".fm-bar") ).done(function(){
				bindHotkey('#fm-player-container');
				$FM.fadeIn(1000);
				initToggleBtn();

				initChannel( $FM.find(".channel-bar") , player ).done(function(){
				});

				initLyric( $FM.find('.fm-bar') , player ).done(function(){
					window.lyric = Lyric( player,$FM.find('.lyric-container') );
					bindLyric( lyric , $FM , $FM.find('.lyric-container') );
				});
			});
		});
	}

	init();

})(window,document,jQuery);
