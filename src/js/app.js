var canvas = window.a
	, context = window.c

/**
 * Displays game state
 * 
 * @constructor
 */
var BoardView = function () {
	
}

/**
 * A single piece to be added to the board
 * 
 * @constructor
 */
var PieceView = function () {

}


/**
 * Contains all other views
 */
var AppView = function () {
	this.board = new BoardView()
	this.bindEvents()
}

/**
 * 
 * @return {[type]} [description]
 */
AppView.prototype.bindEvents = function () {

}

/**
 * 
 * @return {[type]} [description]
 */
AppView.prototype.startGame = function() {
	/*
	clear board...
	 */
}

// make it happ'n, cap'n
var app = new AppView()

app.startGame()