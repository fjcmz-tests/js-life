/**
 Namespace for the simple LifeGame JavaScript Library.
 */
var LifeGame = {};

/**
 Size of each cell when rendered in screen in pixels.
 */
LifeGame.CellSize = 3;

/**
 A CellWorld that holds the basic structure and algorithm for a world of cells to live.
 Knowns the width and height of the worls. Knows the cells. Uses 2 arrays to hold cells
 and calculate the next iterations of cells. Uses the classical rules from the conway's
 Game of Life.
 */
LifeGame.CellWorld = function(width, height) {
	// The width of the world.
	this.width = width;
	// The height of the world.
	this.height = height;
	// Total number of cells in the world.
	this.nCells = this.width * this.height;
	// Array that contains the latest state of the world of cells.
	// 1 meas alive cell. 0 means dead cell.
	this.cells = {};
	// Helper array when calculating the next iteration of the game of life.
	this.helperCells = {};
	// Population of this cell world.
	this.population = 0;

	/**
	  Initializaton of the different cell arrays to 0.
          */
	this.init = function() {
		this.initArray(this.cells, this.nCells);
		this.initArray(this.helperCells, this.nCells);
	}

	/**
	  Initialization of one array to 0.
          */
	this.initArray = function(array, l) {
		for (var i = 0; i < l; i++) {
			array[i] = 0;
		}
	}

	/**
	  Initializes one array to 0, then fills it with 1s randomly.
	  */
	this.randomInit = function() {
		this.iterations = 0;
		this.init();
		this.randomize();
	}

	/**
	  Fills the given array with 1s randomly.
	  */
	this.randomize = function() {
		var rand = 0;
		for (var i = 0; i < this.nCells; i++) {
			rand = Math.floor(Math.random()*2);
			if (rand < 1) {
				this.cells[i] = 1;
			} else {
				this.cells[i] = 0;
			}
		}
	}

	/**
	  Living algorithm that uses the rules of the classic Conway's Game Of Life.
	  Uses a helper array of cells to calculate the next state of the cell world.
	  An alive cell will continue to be alive if it has exactly two or three neighbours.
          A dead cell will resurrect if it has exactly three cells.
	  */
	this.live = function() {
		this.initArray(this.helperCells, this.nCells);
		// calculate the number of neighbours per cell.
		var neighbours = 0;
		this.population = 0;
		// calculate the central block
		var startx = 1;
		var starty = 1;
		var endx = this.width - 1;
		var endy = this.height - 1;
		for (var x = startx; x < endx; x++) {
			for (var y = starty; y < endy; y++) {
				if (this.cell(x, y) > 0) {
					this.population++;
				}
				neighbours = 0;
				if (this.cell(x - 1, y - 1) > 0) {
					neighbours++;
				}
				if (this.cell(x - 1, y) > 0) {
					neighbours++;
				}
				if (this.cell(x - 1, y + 1) > 0) {
					neighbours++;
				}
				if (this.cell(x, y - 1) > 0) {
					neighbours++;
				}
				if (this.cell(x, y + 1) > 0) {
					neighbours++;
				}
				if (this.cell(x + 1, y - 1) > 0) {
					neighbours++;
				}
				if (this.cell(x + 1, y) > 0) {
					neighbours++;
				}
				if (this.cell(x + 1, y + 1) > 0) {
					neighbours++;
				}
				this.check(x, y, neighbours);
			}
		}
		// Exchange cell arrays
		// When the living algorithm ends the 'cells' array contains the new iteration of the world state.
		var temp = this.helperCells;
		this.helperCells = this.cells;
		this.cells = temp;		
	}

	/**
	  Checks whether the given position against the given number of neighbours
	  and sets the corresponding value in the helper array.
	  */
	this.check = function(x, y, neighbours) {
		var localCell = this.cell(x, y);
		if (localCell < 1) {
			// Dead cell
			if (neighbours == 3) {
				this.setCell(this.helperCells, x, y, 1);
			}
		} else {
			// Alive cell
			if (neighbours >= 2 && neighbours <= 3) {
				this.setCell(this.helperCells, x, y, 1);
			}
		}
	}

	/**
	  Gets the value of the cell in position x, y in the array of 'cells'.
	  */
	this.cell = function(x, y) {
		return this.getCell(this.cells, x, y);
	}

	/**
	  Gets the value of the cell in position x, y in the given array.
	  */
	this.getCell = function(array, x, y) {
		var location = 0;
		location = (y * this.width) + x;
		return array[location];
	}

	/**
	  Sets the given value in the given array in position x, y.
	  */
	this.setCell = function(array, x, y, val) {
		var location = y * this.width + x;
		array[location] = val;
	}

}

/**
  A renderer that grabs a LifeGame.CellWorld and will render it in a 2D canvas.
  */
LifeGame.Renderer = function(ctx, stl) {
	// The 2D context 
	this.context = ctx;
	// The style with which to render the cells.
	this.style = stl;

	/**
	  Will render the cells from the CellWorld to the 2D context, using the style.
	  */
	this.render = function(cellWorld, cellSize) {
		var width = cellWorld.width;
		var height = cellWorld.height;
		var nCells = width * height;
		this.context.fillStyle = "rgb(255, 255, 255)";
		this.context.fillRect(0, 0, width * cellSize, height * cellSize);
		this.context.fillStyle = this.style;
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				if (this.getCell(cellWorld.cells, x, y, width) > 0) {
					this.context.fillRect(x*cellSize, y*cellSize, cellSize - 1, cellSize - 1);
				}
			}
		}
	}

	/**
	  Getter for the value of a cell in an array in position x, y.
	  */
	this.getCell = function(array, x, y, width) {
		var location = 0;
		location = (y * width) + x;
		return array[location];
	}
}

/**
  An animator that can start, pause, reset and speed-up the animation of the Life Of Game.
  */
LifeGame.Animator = function(cellWorld, renderer) {
	this.cellWorld = cellWorld;
	this.renderer = renderer;

	this.ips = 1;
	this.iterations = 0;
	this.active = false;

	this.ipsInfo = null;
	this.fpsInfo = null;
	this.iterationsInfo = null;
	this.pauseButton = null;

	var intervalRunner = null;

	this.live = function() {
		this.cellWorld.live();
		this.renderer.render(this.cellWorld, LifeGame.CellSize);
		this.iterations++;
	}

	this.oneStep = function() {
		var start = (new Date()).getTime();
		this.live();
		var end = (new Date()).getTime();
		var elapsed = end - start;
		var fps = 1000 / elapsed;
		if (this.fpsInfo != null) {
			this.fpsInfo.textContent = "" + fps + " frames per second.";
		}
		if (this.iterationsInfo != null) {
			this.iterationsInfo.textContent = "" + this.iterations + " iterations.";
		}
	}

	this.animate = function() {
		if (animator.active) {
			animator.oneStep();
		}
	}

	this.start = function() {
		if (!this.active) {
			this.active = true;
			this.intervalRunner = setInterval(animator.animate, 1000 / this.ips);
		}
	}

	this.reset = function() {
		this.cellWorld.randomInit();
		this.renderer.render(this.cellWorld, LifeGame.CellSize);
	}

	this.advance = function() {
		if (this.active) {
			this.pause();
		}
		this.oneStep();
	}

	this.increaseSpeed = function() {
		clearInterval(this.intervalRunner);
		this.ips++;
		this.intervalRunner = setInterval(animator.animate, 1000 / this.ips);
		if (this.ipsInfo != null) {
			this.ipsInfo.textContent = "" + this.ips + " iterations per second.";
		}
	}

	this.pause = function() {
		if (this.active) {
			this.active = false;
			if (this.pauseButton != null) {
				this.pauseButton.textContent = "Restart";
			}
			clearInterval(this.intervalRunner);
		} else {
			this.active = true;
			if (this.pauseButton != null) {
				this.pauseButton.textContent = "Pause";
			}
			this.intervalRunner = setInterval(animator.animate, 1000 / this.ips);
		}
	}

}


/**
  A factory to create new instances of the LifeGame
  */
LifeGame.newInstance = function(width, height, context, style, cellSize) {
	
}



////////////////////
////////////////////

var animator = null;

function initLifeGame() {
	var canvas = document.getElementById("life_canvas");
	var ctx = canvas.getContext("2d");

	var w = canvas.width;
	var h = canvas.height;
	w = Math.floor(w / LifeGame.CellSize);
	h = Math.floor(h / LifeGame.CellSize);

	// Create LifeGame
	var cellWorld = new LifeGame.CellWorld(w, h);
	cellWorld.randomInit();
	var renderer = new LifeGame.Renderer(ctx, "rgb(0, 0, 0)");
	animator = new LifeGame.Animator(cellWorld, renderer);	

	var ipsInfo = document.getElementById("ips");
	var fpsInfo = document.getElementById("fps");
	var iterationsInfo = document.getElementById("iterations");
	var pauseButton = document.getElementById("pause");
	animator.ipsInfo = ipsInfo;
	animator.fpsInfo = fpsInfo;
	animator.iterationsInfo = iterationsInfo;
	animator.pauseButton = pauseButton;
}

function loaded() {
	initLifeGame();
	animator.start();
}

//

function reset() {
	animator.reset();
}

function pause() {
	animator.pause();
}

function advance() {
	animator.advance();
}

function increaseSpeed() {
	animator.increaseSpeed();
}



