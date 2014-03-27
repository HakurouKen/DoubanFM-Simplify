window.bindPlayer = function(player){
	var $player = $("#fm-player-container"),
		$heart = $player.find("a.btn.heart"),
		$loader = $player.find(".player");

	$heart.bind("click",function(){
		if( $(this).toggleClass('hearted').hasClass("hearted") ){
			player.heart(true);
		}else{
			player.heart(false);
		}
	});

	player.bind("play",function(){
		var info = player.getSongInfo();
		if( info.like == 1 ){
			$heart.addClass('hearted');
		}else{
			$heart.removeClass('hearted');
		}
	});

	$player.find("a.btn.trash").bind("click",function(){
		player.trash();
	});

	$player.find("a.btn.next").bind("click",function(){
		player.next();
	});

	$player.find("a.btn.prev").bind("click",function(){
		player.prev();
	});

	$player.find(".btn.pause").bind("click",function(event){
		event.stopPropagation();
		$(".player-container").addClass("paused");
		player.pause();
	});

	$player.delegate('.player-container.paused', 'click', function(event) {
		$(this).removeClass('paused');
		player.resume();
	});

	$player.find(".volume-wrapper").bind('click',function(event){
		event.stopPropagation();
		event = event ? event : window.event;
		var $vol = $(this).find(".volume"),
			$curVal = $vol.find('.current-volume'),
			per = (event.clientX - $vol.offset().left) / $vol.width();

		player.vol(per*100);
		$curVal.css("width",per*$vol.width()+"px");
	});

	$player.find("div.player-wrapper").bind('click',function(event){
		event = event ? event : window.event;
		var newProgress = (event.clientX - $loader.offset()["left"]) / $loader.width();
		player.jumpTo( newProgress*100 + "%" );
	});

	$player.find(".cover").bind('click',function(event){
		/*
		use
			$(this).data("album")
		will caused a bug that:
		though the attribute data-album refreshed,the page still open the first page  
		*/
		window.open($(this).attr("data-album"));
	});

	$player.find(".loop").bind('click',function(event){
		if(player.loop()){
			player.loop(false);
			$(this).removeClass('on').addClass('off').text("单曲循环：关");
		}else{
			player.loop(true);
			$(this).removeClass('off').addClass('on').text("单曲循环：开");
		}
	});

	$player.find(".download").bind('click',function(event){
		console.log(this);
		chrome.extension.sendMessage({
				"action": "download",
				"url": this.href,
				"name": this.title.replace("下载 : ","") + "." +
							( this.href.match(/\.\w+$/) || [""] )[0].substr(1)
			},function(){
			}
		);
		event.preventDefault();
	});

	// run once
	delete window.bindPlayer;
};