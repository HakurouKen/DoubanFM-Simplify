var Lyric = (function(window, document, $, undefined) {

	var Lyric = function(dom) {
		var _lrc = [],
			_lrcDom = dom;
		return {
			initLrc: function(lrc){
				var list = _lrcDom.find('ul.lyrics').empty();
				_lrc = lrc;
				lrcHTML = "";
				_lrc.forEach(function(l){
					lrcHTML += '<li class="lrc" time = '
								+ l.time + '>' 
								+ l.lrc + '</li>';
				});
				list.html(lrcHTML);
			},
			getLrc: function(){
				return _lrc;
			}
		}
	}

	return Lyric;

})(window, document, jQuery);

var testLrc = [{"lrc": "Made by \u6b63\u4e01\u4e01", "time": 11580}, {"lrc": "You come to me with your scars on your wrist", "time": 17700}, {"lrc": "You tell me this will be the last night feeling like this", "time": 22430}, {"lrc": "I just came to say goodbye", "time": 28680}, {"lrc": "I didn\u2019t want you to see me cry, I\u2019m fine", "time": 33640}, {"lrc": "But I know it\u2019s a lie", "time": 34850}, {"lrc": "", "time": 38670}, {"lrc": "Chorus:", "time": 38930}, {"lrc": "This is the last night you\u2019ll spend alone", "time": 39270}, {"lrc": "Look me in the eyes so I know you know", "time": 42710}, {"lrc": "I\u2019m everywhere you want me to be", "time": 45100}, {"lrc": "The last night you\u2019ll spend alone", "time": 51000}, {"lrc": "I\u2019ll wrap you in my arms and I won't let go", "time": 53480}, {"lrc": "I\u2019m everything You need me to be", "time": 56210}, {"lrc": "", "time": 63060}, {"lrc": "Your parents say everything is your fault", "time": 68400}, {"lrc": "But they don\u2019t know you like I know you they don't know you at all", "time": 72540}, {"lrc": "I\u2019m so sick of when they say", "time": 79780}, {"lrc": "It's just a phase, you'll be o.k. you're fine", "time": 82760}, {"lrc": "But I know it's a lie", "time": 87270}, {"lrc": "This is the last night you\u2019ll spend alone", "time": 90020}, {"lrc": "Look me in the eyes so I know you know", "time": 96090}, {"lrc": "I\u2019m everywhere you want me to be", "time": 97040}, {"lrc": "The last night you\u2019ll spend alone", "time": 102070}, {"lrc": "I\u2019ll wrap you in my arms and I won't let go", "time": 107270}, {"lrc": "I\u2019m everything You need me to be", "time": 108300}, {"lrc": "", "time": 114690}, {"lrc": "The night is so long when everything\u2019s wrong", "time": 128360}, {"lrc": "If you give me a chance", "time": 132600}, {"lrc": "I will help you hold on", "time": 136970}, {"lrc": "Tonight", "time": 138770}, {"lrc": "Tonight", "time": 141310}, {"lrc": "", "time": 146600}, {"lrc": "This is the last night you\u2019ll spend alone", "time": 152730}, {"lrc": "Look me in the eyes so I know you know", "time": 155220}, {"lrc": "I\u2019m everywhere you want me to be", "time": 157710}, {"lrc": "The last night you\u2019ll spend alone", "time": 163910}, {"lrc": "I\u2019ll wrap you in my arms and I won't let go", "time": 167020}, {"lrc": "I\u2019m everything You need me to be", "time": 169400}, {"lrc": "", "time": 172920}, {"lrc": "Altro:", "time": 174960}, {"lrc": "I won\u2019t let you say goodbye", "time": 175410}, {"lrc": "And I\u2019ll be your reason why", "time": 179160}, {"lrc": "The last night away from me", "time": 186160}, {"lrc": "Away from me", "time": 191240}, {"lrc": "", "time": 194780}];


var lyric = Lyric( $('.lyric-container') );
	lyric.initLrc(testLrc);

