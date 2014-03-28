<div class="channel-list-container">
	{{#each channel_list}}
		<div class="channel-list-wrapper">
			{{#if this.title}}
			<h3 class="title">
				我的收藏
				<span class="spliter"></span>
			</h3>
			{{/if}}
			<ul class="channel-list" data-area='{{this.area}}'>
				{{#each this.channels}}
				<li class="channel" data-intro="{{this.intro}}" data-songNum="{{this.song_num}}" data-cid="{{this.id}}">
					<a class="channel-name-container">
						<span class="channel-name">{{this.name}}</span>
					</a>
				</li>
				{{/each}}
			</ul>
		</div>
	{{/each}}
</div>