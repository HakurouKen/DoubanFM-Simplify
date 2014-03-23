var Player = (function(window,document,$,undefined){
	var Player = function(playerDom){
		var _$playerDom = playerDom ? 
							typeof playerDom === "string" ? $(playerDom) : playerDom
						 		: $("body"),
			_$loader = _$playerDom.find(".player"),
			_list = [],
			_info = {},
			_aud = new Audio(), // the audio dom
			_state, // the player playing status
			_length, // the song's length (second)
			_loadingProgress, // the player loading progress
			_playingProgress, // the player playing progress
			_volume, // the player volume
			_loop, // whether loop a song or not 
			_songIndex = -1;
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
				changeItem("div.cover>img","src",info.picture.replace(/\/mpic\//,"\/lpic\/"));
				changeItem(".cover","data-album","http://music.douban.com"+info.album);
				changeItem(".infos .artist","text",info.artist);
				changeItem(".infos .album-title","text","<"+info.albumtitle+">");
				changeItem(".infos .year","text",info.public_time);
				changeItem(".infos .title-roller a","text",info.title);
				changeItem(".infos .title-roller a","href","http://music.douban.com"+info.album);
			}
		}

		var that = {
			initSong: function(info,cb){
				_info = info;
				_list.push(info);
				_songIndex++;
				_aud.src = info.url;
				changeSong(info);
				cb && cb(info);
				console.log(_list);
				console.log(_songIndex);
				return this;
			},
			getState: function(){
				return _state;
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
				$.ajax({
					"url":"/j/mine/playlist",
					"method":"GET",
					"data":{
						type: type ? type : "n",
						sid: _info.sid,
						pt: Math.round(_aud.currentTime * 10) /10.0,
						channel: $(".channel_list .channel.selected").data("cid") || 0,
						pb: 64,
						from : "mainsite",
						r: Math.round(Math.random()*0xffffffffff).toString(16)
					},
					"success": function(data){
						if(typeof cb === "function"){
							cb(data);
						}
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
			prev: function(cb){
				_songIndex =  --_songIndex >=0 ? _songIndex : 0;
				this.initSong(_list[_songIndex],cb);
				return this;
			},
			heart: function(like){
				this.getNextSongList( like?"r":"u" );
				return this;
			},
			end: function(cb){
				this.getNextSongList("e");
				_$playerDom.find("a.btn.next").click();
				return this;
			},
			trash: function(cb){
				var self = this;
				this.getNextSongList("b",function(info){
					self.initSong(info.song[0],cb);					
				});
				return this;
			},
			next: function(cb){
				var self = this;
				this.getNextSongList("s",function(info){
					self.initSong(info.song[0],cb);
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
				_loop = !!l;
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
			_loop = _aud.loop;
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

		_aud.addEventListener('progress',function(){
			var len = _aud.buffered.length ? _aud.buffered.length - 1 : 0;
			setTimeout(function(){
				_loadingProgress = _aud.buffered.end(len) / _length;
			},1000);
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

		/* event listener : UI binder*/
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

		return that;
	
	}

	return Player;
})(window,document,jQuery);