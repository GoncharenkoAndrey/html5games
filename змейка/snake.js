game.snake = {
	game: game,
	cells: [],
	moving: false,
	direction: false,
	directions: {
		up:{
			row: -1,
			col: 0,
			angle: Math.PI
		},
		down:{
			row: 1,
			col: 0,
			angle: 0
		},
		left:{
			row: 0,
			col: -1,
			angle: Math.PI / 2
		},
		right:{
			row: 0,
			col: 1,
			angle: 1.5 * Math.PI
		}
	},
	create: function(){
		let startCells = [
			{row: 7, col: 7},
			{row: 8, col: 7}
		];
		for(let startCell of startCells){
			this.cells.push(this.game.board.getCell(startCell.row, startCell.col));
		}
		this.direction = this.directions.up;
	},
	start(keyCode){
		switch(keyCode){
		case 38:
			this.direction = this.directions.up;
			break;
		case 37:
			this.direction = this.directions.left;
			break;
		case 39:
			this.direction = this.directions.right;
			break;
		case 40:
			this.direction = this.directions.down;
			break;
		}
		if(!this.moving){
			this.game.onSnakeStart();
		}
		this.moving = true;
	},
	hasCell(cell){
		return this.cells.find(part => part === cell);
	},
	getNextCell(){
		let head = this.cells[0];
		let row = head.row + this.direction.row;
		let col = head.column + this.direction.col;
		return this.game.board.getCell(row, col);
	},
	move(){
		if(this.moving){
			let cell = this.getNextCell();
			if(!cell || this.hasCell() || this.game.board.isBombCell(cell)){
				this.game.stop();
			}
			else {
				this.cells.unshift(cell);
				if(!this.game.board.isFoodCell(cell)){
					this.cells.pop();
				}
				else {
					this.game.onSnakeEat();
				}
			}
		}
		
	},
	renderHead(){
		let head = this.cells[0];
		let halfSize = this.game.sprites.head.width /2;
		this.game.context.save();
		this.game.context.translate(head.x, head.y);
		this.game.context.translate(halfSize, halfSize);
		this.game.context.rotate(this.direction.angle);
		this.game.context.drawImage(this.game.sprites.head, -halfSize, -halfSize);
		this.game.context.restore();
	},
	renderBody(){
		for(let i = 1; i < this.cells.length; i++){
			this.game.context.drawImage(this.game.sprites.body, this.cells[i].x, this.cells[i].y);
		}
	},
	render: function(){
		this.renderHead();
		this.renderBody();
	}
};