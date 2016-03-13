/**
 * Displays game state
 * 
 * @constructor
 */
var BoardView = function () {
	this.__model = {
		state: []
	}

	this.reset()
}

/**
 * [getHighestValue description]
 * @return {[type]} [description]
 */
BoardView.prototype.getHighestValue = function () {
	return 0
}

/**
 * [reset description]
 * @return {[type]} [description]
 */
BoardView.prototype.reset = function () {
	this.__model.state = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	]

	return this
}

/**
 * [getRowColumn description]
 * @param  {[type]} pos [description]
 * @return {[type]}     [description]
 */
BoardView.prototype.getRowColumn = function(pos) {
	var x  = pos.x || NaN
		, y  = pos.y || NaN
		, cx = x + CONFIG.PIECE.SIZE
		, cy = y + CONFIG.PIECE.SIZE
		, isOverBoard = CONFIG.BOARD.X < cx && cx < CONFIG.BOARD.X + CONFIG.BOARD.WIDTH &&
										CONFIG.BOARD.Y < cy && cy < CONFIG.BOARD.Y + CONFIG.BOARD.HEIGHT

	if (isOverBoard) {
		return [0, 0]
	} else {
		return null
	}
}

/**
 * 
 */
BoardView.prototype.trySet = function (xy, piece) {
	var x = xy[0]
		, y = xy[1]
		// can be set logic
		, validDrop = true

	if (validDrop) {
		this.__model.state[x][y] = piece.__model.value[0]
	}

	return validDrop
}