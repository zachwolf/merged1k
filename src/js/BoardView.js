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
		, cx = x + CONFIG.PIECE.SIZE - CONFIG.BOARD.X
		, cy = y + CONFIG.PIECE.SIZE - CONFIG.BOARD.Y
		, isOverBoard = CONFIG.BOARD.X < cx && cx < CONFIG.BOARD.X + CONFIG.BOARD.WIDTH &&
										CONFIG.BOARD.Y < cy && cy < CONFIG.BOARD.Y + CONFIG.BOARD.HEIGHT

	if (isOverBoard) {
		var dropX = Math.floor(((cx - CONFIG.BOARD.X) / CONFIG.BOARD.WIDTH) * 5)
			, dropY = Math.floor(((cy - CONFIG.BOARD.Y) / CONFIG.BOARD.HEIGHT) * 5)

		return [dropX, dropY]
	} else {
		return null
	}
}

/**
 * 
 */
BoardView.prototype.trySet = function (xy, piece) {
	var x0  = xy[0]
		, y0  = xy[1]
		, xy0 = this.__model.state[y0][x0]
		, x1 
		, y1 
		, xy1
		// can be set logic
		, validDrop = (function(self){
				// if first block is on an occupied piece
				if (xy0 !== 0) {
					return false
				}

				if (piece.length === 2) {
					x1 = xy[0] + (!!~[0,180].indexOf(piece.__model.rotation) ? 1 : 0)
					y1 = xy[1] + (!!~[0,180].indexOf(piece.__model.rotation) ? 0 : 1)

					// two piece is off board to bottom
					if (y1 >= self.__model.state.length) {
						return false
					}

					// two piece is off board to right
					if (x1 >= self.__model.state[0].length) {
						return false
					}

					xy1 = self.__model.state[y1][x1]

					// if second block is on an occupied piece
					if (xy1 !== 0) {
						return false
					}
				}

				return true
			}(this))

	if (validDrop) {
		// todo set correct positioning of complex pieces
		this.__model.state[y0][x0] = piece.__model.value[0]

		if (piece.length === 2) {
			this.__model.state[y1][x1] = piece.__model.value[1]
		}
	}

	return validDrop
}