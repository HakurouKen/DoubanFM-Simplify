var Player = (function(window,document,$,undefined){
	var Player = function(playerDom){
		var _$playerDom = playerDom ? 
							typeof playerDom === "string" ? $(playerDom) : playerDom
						 		: $("body"),
			_$loader = _$playerDom.find(".player"),
			_list = [], // the song already played
			_index = -1, // the current song index in the _list
			_songList = [], // the songlist return from douban
			_songIndex = 0, // the current song index in the _songList
			_info = {}, // the current song info
			_aud = new Audio(), // the audio dom
			_state, // the player playing status
			_length, // the song's length (second)
			_loadingProgress, // the player loading progress
			_playingProgress, // the player playing progress
			_volume, // the player volume
			_loop = false; // whether loop a song or not 
			_aud.autoplay = true;
		
		function changeSong(info){
			function changeItem(selector,attr,val){
				var dom = typeof selector === "string" ? _$playerDom.find(selector) : selector;
				if(attr === "text"){
					dom.text(val);
				}else if(attr === "html"){
					dom.html(val);
				}else{
					_$playerDom.find(selector).attr(attr,val);
				}
			}

			if(info){
				album = /\/subject\//.test(info.album) ? "http://music.douban.com" + info.album : info.album;
				var title = info.title + " - " + info.artist;
					title = title.length < 25 ? title : title.substr(0,23)+"...";

				var pic = info.picture.replace(/\/mpic\//,"\/lpic\/");

				changeItem("div.cover>img","src",pic); // img link
				changeItem("div.cover>img","alt",info.title); // img alternative
				changeItem(".cover","data-album","http://music.douban.com"+info.album); // album link
				changeItem(".infos .artist","text",info.artist); // artist
				changeItem(".infos .album-title","text","<"+info.albumtitle+">"); // album title
				changeItem(".infos .year","text",info.public_time); // year
				changeItem(".infos .title-roller a","text",info.title); // title
				changeItem(".infos .title-roller a","href","http://music.douban.com"+info.album); // douban album link
				changeItem(".download","text", title ); // the download link
				changeItem(".download","title","下载 : " + info.title + " - " + info.artist ); // download title
				changeItem(".download","href", info.url ); // download link
				$("title").text(info.title + " - 豆瓣FM"); // title
			}
		}

		var that = {
			isAd: function(info){
				return !/^\/subject\//.test(info.album);
			},
			initSong: function(info,isPrev){
				var self = this,
					isPrev = isPrev === undefined ? true : false;
				if( !this.isAd(info) ){
					_info = info;
					_aud.src = info.url;
					changeSong(info);
					if(isPrev){
						_index = _list.length;
						_list.push(info);
					}
					chrome.extension.sendMessage({
						"action": "notification",
						"info" : info
					},function(){
					});
				}else{
					self.initSong.caller.apply(this);
				}
				return this;
			},
			getState: function(){
				return _state;
			},
			getLength: function(){
				return _length;
			},
			getSongInfo: function(){
				return _info;
			},
			getCurTime: function(){
				return _aud.currentTime;
			},
			getSongList: function(){
				return _list;
			},
			getNextSongList: function(type,cb){
				var self = this,
					isPro = Utils.hasCookie('show_pro_expire_tip') || Utils.hasCookie('show_pro_init_tip'),
					data = {
						type: type ? type : "n",
						sid: _info.sid,
						pt: Math.round(_aud.currentTime * 10) /10.0,
						channel: $("#fm-html5 ul.channel-list li.channel.selected").data("cid") || 0,
						pb: 64,
						from : "mainsite",
						r: Math.round(Math.random()*0xffffffffff).toString(16)
					};

					if(isPro){
						data.pb = 192;
						data.kbps = 192;
					}

				$.ajax({
					"url":"/j/mine/playlist",
					"data": data,
					"success": function(data){
						if(type !== "e"){
							_songIndex = 0;
							_songList = data.song;
						}
						cb && cb(data);
					},
					"error": function(){
						setTimeout(function(){
							self.getNextSongList(type);	
						},10000);
					}
				});				
			},
			play: function(){
				_aud.currentTime = 0;
				_aud.play();
				return this;
			},
			pause: function(){
				_aud.pause();
				return this;
			},
			resume: function(){
				_aud.play();
				return this;
			},
			prev: function(){
				_index =  --_index >=0 ? _index : 0;
				this.initSong(_list[_index],false);
				return this;
			},
			heart: function(like){
				this.getNextSongList( like?"r":"u" );
				return this;
			},
			end: function(){
				var self = this;
				self.getNextSongList("e");
				if( _songList[++_songIndex] !== undefined ){
					self.initSong(_songList[_songIndex]);
				}else{
					this.getNextSongList("p",function(info){
						self.initSong(info.song[0]);
					});
				}
				return this;
			},
			trash: function(){
				var self = this;
				this.getNextSongList("b",function(info){
					self.initSong(info.song[0]);					
				});
				return this;
			},
			next: function(){
				var self = this;
				this.getNextSongList("s",function(info){
					self.initSong(info.song[0]);
				});
				return this;
			},
			vol: function(vol){
				if(vol !== undefined){
					vol = parseInt(vol);
					vol = vol > 100 ? 100 : 
								vol < 0 ? 0 : vol;
					_aud.volume = vol/100;
					return this;
				}
				return _volume;
			},
			volUp: function(num){
				this.vol(_volume + num);
				return this;
			},
			volDown: function(num){
				this.vol(_volume - num);
				return this;
			},
			mute: function(){
				this.vol(0);
				return this;
			},
			jumpTo: function(progress){
				var timeArr = [],
					l,
					res = 0;
				if (typeof progress === "number"){
					res = progress;
				}else if(typeof progress === "string"){
					if(progress.substr(-1) === "%"){
						res = parseInt(progress.slice(0,-1)) * _aud.duration / 100 ;
					}else{
						timeArr = progress.split(":");
						l = timeArr.length;
						timeArr.forEach(function(time,index){
							res += parseInt(time) * Math.pow( 60 , (l - 1 - index) );
						});
					}
				}

				if(typeof res === "number"){
					_aud.currentTime = parseInt(res);	
				}
				return this;
			},
			loop: function(l){
				if(l === undefined){
					return _loop;
				}
				_loop = _aud.loop = !!l;
				return this;
			},
			/* bind && once : use for UI update and other event binds*/
			bind: function(event,cb){
				_aud.addEventListener(event,cb);
			},
			once: function(e,cb){
				_aud.addEventListener(e,function(event){
					cb(event);
					this.removeEventListener(e,arguments.callee);
				});
			}
		};

		/* event listener : data-binder*/
		_aud.addEventListener('loadstart',function(){
			_state = _aud.paused ? "paused" : "playing";
			_length = _aud.duration;
			_loadingProgress;
			_playingProgress = _aud.currentTime / _aud.duration;
			_volume = _aud.volume * 100;
			_aud.loop = _loop;
		});

		_aud.addEventListener('play',function(){
			_state = 'playing';
		});

		_aud.addEventListener('pause',function(){
			_state = 'pause';
		});

		_aud.addEventListener('durationchange',function(){
			_length = _aud.duration;
		});

		_aud.addEventListener('timeupdate',function(){
			var len = _aud.buffered.length ? _aud.buffered.length - 1 : 0;
			_loadingProgress = _aud.buffered.end(len) / _length;
		});

		_aud.addEventListener('timeupdate',function(){
			_playingProgress = _aud.currentTime / _length;
		});

		_aud.addEventListener('volumechange',function(){
			_volume = _aud.volume * 100;
		});

		_aud.addEventListener('ended',function(){
			if(_loop){
				that.play();
			}else{
				that.end();
			}
		});

		_aud.addEventListener('error',function(){
			that.end();
		});

		/* event listener : basic UI binder*/
		_aud.addEventListener('progress',function(){
			var len = _aud.buffered.length ? _aud.buffered.length - 1 : 0;
			_$playerDom.find(".load-progress").width(_$loader.width()*_loadingProgress);
		});

		_aud.addEventListener('timeupdate',function(){
			var remain = _length - _aud.currentTime,
				timeStamp = "-" + Math.floor(remain / 60) + ":" + ("0" + parseInt(remain % 60)).substr(-2) ;
			_$playerDom.find(".controller .time").text(timeStamp);
			_$playerDom.find(".play-progress").width(_$loader.width()*_playingProgress);
		});

		_aud.addEventListener('volumechange',function(){
			var $vol = _$playerDom.find(".volume"),
				$curVal = $vol.find('.current-volume');

			$curVal.css("width", _volume/100 * $vol.width() + "px");
		});

		_$playerDom.find(".cover img").load(function(){
			var img = new Image(),
				img_size = 245 ;
			img.src = _info.picture.replace(/\/mpic\//,"\/lpic\/");
			if( img.width / img.height > 1.1 ){
				$(this).css("width",img_size)
					.css("height","auto");
			} else if ( img.height / img.width > 1.1 ){
				$(this).css("height",img_size)
					.css("width","auto");
			} else {
				$(this).css("height",img_size)
					.css("width",img_size);
			}
		});

		return that;
	
	}

	return Player;
})(window,document,jQuery);
