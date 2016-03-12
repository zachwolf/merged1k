/**
 * Contains all other views
 */
var AppView = function (options) {
	// save references to passed paramaters
	this.canvas  = options.canvas
	this.context = options.context
	this.body    = options.body

	// creating child views
	this.board = new BoardView()

	// binding events
	this.bindEvents()
}

/**
 * 
 * @return {[type]} [description]
 */
AppView.prototype.bindEvents = function () {
	this.canvas.addEventListener('mousedown', this.handleDragEvent.bind(this))

	this.body.addEventListener('mouseup', this.handleReleaseEvent.bind(this))
}

/**
 * 
 */
AppView.prototype.handleDragEvent = function (e) {
	e.preventDefault()

	console.log('handle drag', this);
}

/**
 * 
 */
AppView.prototype.handleReleaseEvent = function (e) {
	e.preventDefault()
	console.log('handle drag', this);
}

/**
 * 
 */

/**
 * 
 * @return {[type]} [description]
 */
AppView.prototype.startGame = function() {
	/*
	clear board...
	 */
}