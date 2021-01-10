const KEYS = {
	SPACE:32,
	LEFT:37,
	RIGHT:39
};
let game = {
	context:null,
	rows:4,
	columns:8,
	width:640,
	height:360,
	blocks:[],
	running:true,
	score:0,
	ball:{
			x:320,
			y:280,
			width:20,
			height:20,
			dx:0,
			dy:0,
			velocity:3,
			frame:0,
			start:function(){
				this.dx = game.random(-this.velocity,this.velocity);
				this.dy = -this.velocity;
				this.animate();
				
			},
			animate:function(){
				setInterval(()=>{
					this.frame++;
					if(this.frame > 3){
						this.frame = 0;
					}
				},100);
			},
			move: function(){
				if(this.dx){
					this.x += this.dx;
				}
				if(this.dy){
					this.y += this.dy;
				}
			},
			collide:function(element){
				const x = this.x + this.dx;
				const y = this.y + this.dy;
				if(x + this.width > element.x &&
					x < element.x + element.width &&
					y + this.height > element.y &&
					y < element.y + element.height)
				{
					return true;
				}
				return false; 
			},
			bumpBlock:function(block){
				this.dy *= -1;
				block.active = false;
			},
			bumpPlatform:function(platform){
				if(platform.dx){
					this.x += platform.dx;
				}
				if(this.dy > 0){
					const touchX = this.x + this.width/2;
					this.dx = this.velocity * platform.getTouchOffset(touchX);
					this.dy = -this.velocity;
				}
			},
			collideWorldBounds:function(){
				const x = this.x + this.dx;
				const y = this.y + this.dy;
				const ballLeft = x;
				const ballRight = ballLeft + this.width;
				const ballTop = y;
				const ballBottom = ballTop + this.height;
				const worldLeft = 0;
				const worldRight = game.width;
				const worldTop = 0;
				const worldBottom = game.height;
				if(ballLeft < worldLeft){
					this.x = 0;
					this.dx = this.velocity;
					game.sounds.bump.play();
				}
				else if(ballRight > worldRight){
					this.x = worldRight - this.width;
					this.dx = -this.velocity;
					game.sounds.bump.play();
				}
				else if(ballTop < worldTop){
					this.y = 0;
					this.dy = this.velocity;
					game.sounds.bump.play();
				}
				else if(ballBottom > worldBottom){
					game.result("Вы проиграли");
				}
			}
	},
	platform:{
			x:280,
			y:300,
			width:100,
			height:14,
			dx:0,
			velocity:5,
			ballOnPlatform:true,
			start:function(direction){
				switch(direction){
				case KEYS.LEFT:
					this.dx = -this.velocity;
					break;
				case KEYS.RIGHT:
					this.dx = this.velocity;
					break;
				}
			},
			stop:function(){
				this.dx = 0;
			},
			move:function(){
				if(this.dx){
					this.x += this.dx;
					if(this.ballOnPlatform){
						game.ball.x += this.dx;
					}
				}
			},
			fire:function(){
				if(this.ballOnPlatform){
					game.ball.start();
					this.ballOnPlatform = false;
				}
			},
			getTouchOffset:function(x){
				const different = (this.x + this.width) - x;
				const offset = this.width-different;
				const result = 2*offset/this.width;
				return result - 1;
			},
			collideWorldBounds:function(){
				if(this.x + this.dx < 0 || this.x + this.dx + this.width > game.width){
					this.dx = 0;
				}
			}
	},
	sprites:{
		background:null,
		ball:null,
		platform:null,
		block:null
	},
	sounds:{
		bump:null
	},
	init:function(){
		this.context = document.getElementById("game").getContext("2d");
		this.setTextFont();
		this.addEventLisneters();
	},
	setTextFont:function(){
		this.context.font = "20px Arial";
		this.context.fillStyle = "#FFFFFF";
	},
	addEventLisneters:function(){
		window.addEventListener("keydown", event => {
			this.platform.start(event.keyCode);
		});
		window.addEventListener("keyup", event => {
			if(event.keyCode == KEYS.SPACE){
				this.platform.fire();
			}
			else{
				this.platform.stop();
			}
		});
	},
	preload:function(callback){
		let required = Object.keys(this.sprites).length;
		required += Object.keys(this.sounds).length;
		let loaded = 0;
		const onResourceLoad = ()=>{
			loaded++;
			if(loaded == required){
				callback();
			}
		};
		this.preloadSprites(onResourceLoad);
		this.preloadAudio(onResourceLoad);
	},
	preloadSprites:function(onResourceLoad){
		for(let key in this.sprites){
			this.sprites[key] = new Image();
			this.sprites[key].src = "img/"+key+".png";
			this.sprites[key].addEventListener("load",onResourceLoad);
		}
	},
	preloadAudio:function(onResourceLoad){
		for(let key in this.sounds){
			this.sounds[key] = new Audio("sounds/"+key+".mp3");
			this.sounds[key].addEventListener("canplaythrough",onResourceLoad,{once:true});
		}
	},
	create: function(){
		for(let row = 0; row < this.rows; row++){
			for(let column = 0; column < this.columns; column++){
				this.blocks.push({
					active: true,
					x:64 * column + 65,
					y:24 * row + 35,
					width:60,
					height:20
				});
			}
		}
	},
	addScore:function(){
		this.score++;
		if(this.score >= this.blocks.length){
			game.result("Вы победили");
		}
	},
	collideBlocks:function(){
		for(let i=0;i<this.blocks.length;i++){
			if(this.blocks[i].active && this.ball.collide(this.blocks[i])){
				this.ball.bumpBlock(this.blocks[i]);
				this.addScore();
				this.sounds.bump.play();
			}
		}
	},
	collidePlatform:function(){
		if(this.ball.collide(this.platform)){
			this.ball.bumpPlatform(this.platform);
			this.sounds.bump.play();
		}
	},
	update:function(){
		this.collideBlocks();
		this.collidePlatform();
		this.platform.collideWorldBounds();
		this.ball.collideWorldBounds();
		this.ball.move();
		this.platform.move();
	},
	run:function(){
		if(this.running){
			window.requestAnimationFrame(()=>{
				this.update();
				this.render();
				this.run();
			});
		}
	},
	render:function(){
		this.context.clearRect(0,0,this.width,this.height);
		this.context.drawImage(this.sprites.background,0,0);
		this.context.drawImage(this.sprites.ball,this.ball.frame*this.ball.width,0,this.ball.width,this.ball.height,this.ball.x,this.ball.y,this.ball.width,this.ball.height);
		this.context.drawImage(this.sprites.platform,this.platform.x,this.platform.y);
		this.renderBlocks();
		this.context.fillText("Score: " + this.score, 15, 30);
	},
	renderBlocks:function(){
		for(let i=0;i<this.blocks.length;i++){
			if(this.blocks[i].active){
				this.context.drawImage(this.sprites.block,this.blocks[i].x,this.blocks[i].y);
			}
		}
	},
	start:function(){
		this.init();
		this.preload(()=>{
			this.create();
			this.run();
		});
	},
	result:function(message){
		game.running = false;
		alert(message);
		window.location.reload();
	},
	random:function(min,max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}
};
window.addEventListener("load",function(){game.start();});