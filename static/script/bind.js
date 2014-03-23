var btnBind = function(player){
	var $player = $("#fm-player-container .fm-player"),
		$heart = $player.find("a.btn.heart"),
		$loader = $player.find(".player");

	$heart.bind("click",function(){
		if( $(this).toggleClass('hearted').hasClass("hearted") ){
			player.heart(true);
		}else{
			player.heart(false);
		}
	});

	function setHearted(info){
		if(info.like == 1){
			$heart.addClass("hearted");
		}else{
			$heart.removeClass("hearted");
		}
	}

	$player.find("a.btn.trash").bind("click",function(){
		player.trash(setHearted);
	});

	$player.find("a.btn.next").bind("click",function(){
		player.next(setHearted);
	});

	$player.find("a.btn.prev").bind("click",function(){
		player.prev(setHearted);
	});

	$player.find(".btn.pause").bind("click",function(event){
		event.stopPropagation();
		$(".container").addClass("paused");
		player.pause();
	});

	$player.delegate('.container.paused', 'click', function(event) {
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
}