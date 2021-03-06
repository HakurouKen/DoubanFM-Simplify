var Lyric = (function(window, document, $, undefined) {

	var getBaiduLrc = function(info,cb,failcb){
		var	link,
			getSug = function(){
				return $.get(
					'http://sug.music.baidu.com/info/suggestion?format=json&version=2&from=0&word=' + info.title + "-" + info.artist
				);
			},
			getInfo = function(sug){
				var result = JSON.parse(sug),
					id = (result.data.song[0] || {}).songid;

				if(id){
					return $.ajax({
						url: 'http://play.baidu.com/data/music/songlink',
						method: 'post',
						data: {
							'songIds':id
						},
						dataType: 'json'
					});
				}
				return $.Deferred().reject();
			},
			getLrc = function(info){
				var lrcLink = info.data.songList[0].lrcLink;
				if(lrcLink){
					link = 'http://play.baidu.com'+lrcLink;
					return $.get(link);
				}
				return $.Deferred().reject();
			},
			format = function(raw){
				 var rawArr = raw.split('\n'),
				 	i=0,
				 	len = rawArr.length,
				 	checker = /^\[\d+:\d+(.\d+)\]/,
				 	matcher = /\[\d+:\d+(.\d+)\]/g ,
				 	timeStamps = [],
				 	cur,
				 	curTime,
				 	lrc = [];

				 for( ; i < len ; i++ ){
				 	if( checker.test(rawArr[i]) ){
				 		timeStamps = rawArr[i].match(matcher);
				 		timeStamps.forEach(function(timeStamp){
							cur = {};
				 			cur.lrc = rawArr[i].replace(timeStamps.join(""),"");
				 			curTime = 0;
					 		timeStamp.replace(/[\[\]]/g,"").split(":").forEach(function(t,i){
					 			curTime = curTime*60 + parseFloat(t,10);
					 		});
					 		curTime = curTime*1000;
					 		cur.time = curTime;
					 		lrc.push(cur);
				 		});
				 	}
				 }

				 lrc.sort(function(lrc1,lrc2){
				 	return lrc1.time - lrc2.time;
				 });
				
				 return lrc;
			}

		failcb = failcb || function(){};

		return getSug().done(function(sug){
			getInfo(sug).done(function(info){

				getLrc(info).done(function(raw){
					cb( format(raw) , raw , link);
				}).fail(failcb);

			}).fail(failcb);
		});
	};

	var Lyric = function(player,$dom) {
		var _lrc = [], // the formated lyric
			_$lrcDom = $dom || $('body'), // the lyric container's dom
			_$lrcList = _$lrcDom.find('ul.lyrics'), // the lyric dom
			_$download = _$lrcDom.find('.download-lrc'), // the download dom
			_timeStamps = [], // timestamps for search
			_prefix = 0, // the offset of the song
			_freezed = false, // whether the lyric is rolling
			_link = "", // the download link of the song
			_info, // the song info
			_lrcNow = function(time,start,end){
				var len = _timeStamps.length,
					start = start || 0,
					end = end || len-1,
					mid = Math.floor((start + end)/2);
				for( ; end-start>0 ; ){
					if( time >= _timeStamps[mid] ){
						start = mid + 1;
						mid = Math.floor((start+end)/2);
					}else{
						end = mid;
						mid = Math.floor((start+end)/2);
					}
				}
				
				return {
					startTime: function(){
						return _timeStamps[start-1];
					},
					endTime: function(){
						return _timeStamps[start];
					},
					lines: function(){
						return _$lrcList.find('li.lrc');
					},
					thisLine: function(){
						return start-2>=0 ? this.lines().eq(start-2) : $();
					},
					nextLine: function(){
						return this.lines().eq(start-1);
					},
					offset: function(){
						var offset = 0,
							thisLine = this.thisLine(),
							nextLine = this.nextLine(),
							prevAll = thisLine.prevAll(),
							prevHeight = 0,
							thisH = thisLine.height() || 0,
							nextH = nextLine.height() || 0;
							
							prevHeight += thisLine.height()/2;
							Array.prototype.forEach.call(
								prevAll,
								function(elem){
									prevHeight += $(elem).height();
								}
							);
							
							offset = (thisH + nextH)/2 * (time-this.startTime())/(this.endTime()-this.startTime());
							offset = isNaN(offset) ? _$lrcList.height() : offset + prevHeight;
							return offset;
					}
				};
			};

		var l = {
			initLrc: function(lrc,link){
				_$lrcList.empty().css('margin-top','0px');
				_$lrcDom.find('.lyric-wrapper').removeClass('none');
				_lrc = lrc || [];
				_prefix = 0;
				var	lrcHTML = "";
				if(_lrc.length){
					_timeStamps = Array.prototype.map.call( _lrc , function(l){
						lrcHTML += '<li class="lrc" time = '
									+ l.time + '>' 
									+ (l.lrc || '&nbsp;') + '</li>';
						return l.time;
					});
					_$lrcList.html(lrcHTML);
				}else{
					_$lrcDom.find('.lyric-wrapper').addClass('none');
				}

				_link = link || "";
				_$download.attr('link',_link)
						  .attr('filename',_info.title + '-' + _info.artist);

				_timeStamps.push(player.getLength());
				_timeStamps.unshift(0);

				return this;
			},
			getLrc: function(){
				return _lrc;
			},
			jumpTo: function(time){
				var animationPrefix = 400,
					now = _lrcNow(time*1000 + animationPrefix + _prefix),
					offset = now.offset();
				_$lrcList.css('margin-top','-'+offset+'px');
				now.lines().removeClass('on');
				now.thisLine().addClass('on');
				return this;
			},
			fix: function(prefix){
				_prefix += prefix*1000;
			},
			freeze: function(){
				_freezed = true;
			},
			unfreeze: function(){
				_freezed = false;
			}
		};

		player.bind('loadstart',function(){
			_info = player.getSongInfo();
			l.freeze();

			getBaiduLrc(_info,function(lrc,raw,link){
				l.initLrc(lrc,link);
				l.unfreeze();
			},function(){
				l.initLrc();
			});
		});

		player.bind('timeupdate',function(){
			!_freezed && l.jumpTo(player.getCurTime());
		});

		return l;
	};

	return Lyric;

})(window, document, jQuery);


