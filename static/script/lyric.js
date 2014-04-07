var Lyric = (function(window, document, $, undefined) {

	var Lyric = function(player,$dom) {
		var _lrc = [],
			_$lrcDom = $dom || $('body'),
			_$lrcList = _$lrcDom.find('ul.lyrics'),
			_timeStamps = [],
			_prefix = 0,
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
			initLrc: function(lrc){
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
			}
		};

		player.bind('loadstart',function(){
			var info = player.getSongInfo();
			$.ajax({
				'type':'post',
				'url': 'http://dblrc.sinaapp.com/q',
				'data': {
					'song_name': info.title,
					'artist': info.artist
				},
				'beforeSend': function(){
				},
				'success': function(data){
					var lrc = JSON.parse(data);
					if(lrc.length){
						l.initLrc(lrc);
					}else{
						l.initLrc();
					}
				},
				'error': function(){
					l.initLrc();
				}
			});
		});

		player.bind('timeupdate',function(){
			l.jumpTo(player.getCurTime());
		});

		return l;
	}

	return Lyric;

})(window, document, jQuery);
