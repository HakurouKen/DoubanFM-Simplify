var Channel = (function(window, document, $, undefined) {
	var Channel = function($channelDom, player) {
		var _curChannel = 0;

		return {
			getCurChannel: function() {
				return _curChannel;
			},
			changeChannel: function(from, to, area) {
				var init = function() {
					player.getNextSongList('n', function(data) {
						player.initSong(data.song[0]);
					});
				};

				if (area === "recent_chls" || area === "fav_chls") {
					var ctype;

					switch (area) {
						case "recent_chls":
							ctype = "r";
							break;
						case "fav_chls":
							ctype = "c";
							break;
					}

					$.post("/j/channel_select", {
						"cid": to,
						"ctype": ctype,
						"ck": Utils.getCookie("ck")
					}, function() {});
				}

				$.get("/j/change_channel?fcid=" + from + "&tcid=" + to + "&area=" + area, function(result) {
					_curChannel = to;
					(result.r === "0") && init();
				});
			}
		};
	}

	return Channel;
})(window, document, jQuery);