/**
 * Displays game state
 * 
 * @constructor
 */
var BoardView = function () {
	
}

BoardView.prototype.getHighestValue = function () {
	return 0
}

/**
 * A single piece to be added to the board
 *
 * @param {Function} filter - a way for the model to specify possible pieces
 * @constructor
 */
var PieceView = function (filter) {
	this.__model = {
		value: null,
		possibilities: filter([
			[1],    [2],    [3],    [4],    [5],    [6],   [7],
			        [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
			                [3, 2], [4, 2], [5, 2], [6, 2],
			                        [4, 3], [5, 3], [6, 3],
			                                [5, 4], [6, 4],
			                                        [6, 5]
		])
	}

	this.setValue()

	this.length = this.__model.value.length
}

/**
 * Sets the board pieces value
 */
PieceView.prototype.setValue = function (__seed) {
	this.__model.value = __seed || (function(p){
		return p[Math.floor(Math.random() * p.length)]
	}(this.__model.possibilities))		

	return this
}

// make it happ'n, cap'n
var app = new AppView({
	canvas: window.a,
	context: window.c,
	body: window.b
})

app.startGame()