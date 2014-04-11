(function(window, document, $, undefined) {

	window.bindPlayer = function(player) {
		var $player = $("#fm-player-container"),
			$heart = $player.find("a.btn.heart"),
			$loader = $player.find(".player");

		$heart.bind("click", function() {
			if ($(this).toggleClass('hearted').hasClass("hearted")) {
				player.heart(true);
			} else {
				player.heart(false);
			}
		});

		player.bind("play", function() {
			var info = player.getSongInfo();
			if (info.like == 1) {
				$heart.addClass('hearted');
			} else {
				$heart.removeClass('hearted');
			}
		});

		$player.find("a.btn.trash").bind("click", function() {
			player.trash();
		});

		$player.find("a.btn.next").bind("click", function() {
			player.next();
		});

		$player.find("a.btn.prev").bind("click", function() {
			player.prev();
		});

		$player.find(".btn.pause").bind("click", function(event) {
			event.stopPropagation();
			$(".player-container").addClass("paused");
			player.pause();
		});

		$player.delegate('.player-container.paused', 'click', function(event) {
			$(this).removeClass('paused');
			player.resume();
		});

		$player.find(".volume-wrapper").bind('click', function(event) {
			event.stopPropagation();
			event = event ? event : window.event;
			var $vol = $(this).find(".volume"),
				$curVal = $vol.find('.current-volume'),
				per = (event.clientX - $vol.offset().left) / $vol.width();

			player.vol(per * 100);
			$curVal.css("width", per * $vol.width() + "px");
		});

		$player.find("div.player-wrapper").bind('click', function(event) {
			event = event ? event : window.event;
			var newProgress = (event.clientX - $loader.offset()["left"]) / $loader.width();
			player.jumpTo(newProgress * 100 + "%");
		});

		$player.find(".cover").bind('click', function(event) {
			/*
			use
				$(this).data("album")
			will caused a bug that:
			though the attribute data-album refreshed,the page still open the first page  
			*/
			window.open($(this).attr("data-album"));
		});

		$player.find(".loop").bind('click', function(event) {
			if (player.loop()) {
				player.loop(false);
				$(this).removeClass('on').addClass('off').text("单曲循环：关");
			} else {
				player.loop(true);
				$(this).removeClass('off').addClass('on').text("单曲循环：开");
			}
		});

		$player.find(".download").bind('click', function(event) {
			event.preventDefault();
			chrome.extension.sendMessage({
				"action": "download",
				"url": this.href,
				"name": this.title.replace("下载 : ", "") + "." +
					(this.href.match(/\.\w+$/) || [""])[0].substr(1)
			}, function() {});
		});

		// run once
		delete window.bindPlayer;
	};

	window.bindChannel = function($channelContainer, channel, player) {
		var $channelLists = $channelContainer.find("ul.channel-list"),
			$channels = $channelContainer.find("ul.channel-list li.channel");

		$channelLists.delegate('li.channel', 'click', function(event) {
			var fcid,
				cid,
				area;

			if (!$(this).hasClass('selected')) {
				var fcid = $channels.filter('.selected').data('cid'),
					cid = $(this).data('cid'),
					area = $(this).parent('ul.channel-list').data('area');

				channel.changeChannel(fcid, cid, area);

				$channels.removeClass('selected');
				$(this).addClass('selected');
			}
		});

		$channels.filter("[data-cid=" + (channel.getCurChannel() || 0) + "]").addClass('selected');

		// run once
		delete window.channelBind;
	};

	window.bindToggleBtn = function(selector, $FM, $wrapper, $originPlayer) {
		var originPlayerHTML = $originPlayer.clone().wrap('<div></div>').parent().html();

		console.log($originPlayer.html());
		// change between original douban.fm and plugin
		function pageToggle($FM, $wrapper, $originPlayer) {
			if (!isOrginal) {
				$FM.fadeOut(1000, function() {
					$('.fm-player a.btn.pause').click();

					// prevent the origal player from disloation
					$wrapper.find('#fm-section').css('margin-top', '0px');
					$wrapper.find('#fm-section2').css('margin-top', '0px');
					$wrapper.find('#fm-section-app-entry').css('margin-top', '0px');
					$wrapper.find('#fm-bg').css('margin-top', '0px');

					$wrapper.fadeIn(1000, function() {
						window.isOrginal = true;
					});
				});
				$originPlayer.html(originPlayerHTML);
			} else {
				$wrapper.fadeOut(1000, function() {
					$('.player-container.paused').click();
					$FM.fadeIn(1000, function() {
						window.isOrginal = false;
						$(window).trigger('resize');
					});

					$FM.find("li[data-cid=" + (channel.getCurChannel() || 0) + "]").addClass('selected');
				});
				$originPlayer.html("");
			}
		}

		$('#toggleView').click(function() {
			pageToggle($FM, $wrapper, $originPlayer);
		})

		delete window.bindToggleBtn;
	};

	window.bindHotkey = function(selector) {
		var $playerDom = $(selector);
		$('body').bind('keydown', function(event) {
			if (!window.isOrginal) {
				switch (event.keyCode) {
					case 70: // f(avorite)
						$playerDom.find('a.heart').click();
						break;

					case 68: // d(elete)
						$playerDom.find('a.trash').click();
						break;

					case 83: // s(kip)
						$playerDom.find('a.next').click();
						break;

					case 66: // b(ack)
						$playerDom.find('a.prev').click();
						break;

					case 32: // space
						$playerDom.find('.player-container').hasClass('paused') ?
							$playerDom.find('.player-container').click() :
							$playerDom.find('a.pause').click();
						break;

					case 76: // l(oop)
						$playerDom.find('a.loop').click();
						break;

					case 87: // do(w)nload
						$playerDom.find('a.download').click();
						break;

					default:
						break;
				}
			}
		});

		delete window.bindHotkey;
	};

	window.bindLyric = function(lyric,$FM,$lyricDom){
		var $container = $FM.find('.fm-bar'),
			$player = $FM.find('#fm-player-container');
		
		$(window).resize(function(){
			var remain = $container.height() - $player.height() 
						- parseInt($player.css('margin-top')) - parseInt($player.css('margin-bottom'));

			$lyricDom.height(remain-30);
			$lyricDom.find('.lyric-wrapper').height(remain-30-50);
		});

		$lyricDom.bind('mousewheel',function(event,delta){
			lyric.fix(delta/20);
		});

		$lyricDom.find('.download-lrc').bind('click',function(){
			var link = $(this).attr('link');
			if(link){
				chrome.extension.sendMessage({
					"action": "download",
					"url": link,
					// seems that the text-flow file will not add extension automatically.
					"name": $(this).attr('filename')+'.lrc'
				}, function() {});
			}
		});

		delete bindLyric;
	}

})(window, document, jQuery);
