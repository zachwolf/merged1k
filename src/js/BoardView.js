function validateDrop (m, piece){
	// if first block is on an occupied piece
	if (m.xy0 !== 0) {
		return false
	}

	if (piece.length === 2) {
		m.x1 = m.x0 + (!!~[0,180].indexOf(piece.__model.rotation) ? 1 : 0)
		m.y1 = m.y0 + (!!~[0,180].indexOf(piece.__model.rotation) ? 0 : 1)

		// two piece is off board to bottom
		if (m.y1 >= this.__model.rowLimit) {
			return false
		}

		// two piece is off board to right
		if (m.x1 >= this.__model.colLimit) {
			return false
		}

		m.xy1 = this.__model.state[m.y1][m.x1]

		// if second block is on an occupied piece
		if (m.xy1 !== 0) {
			return false
		}
	}

	return true
}

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

	this.__model.rowLimit = this.__model.state.length
	this.__model.colLimit = this.__model.state[0].length
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
	this.__model.state = CONFIG.BOARD.DEFAULT

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
	var posMap = {
				x0: xy[0],
				y0: xy[1],
				xy0: this.__model.state[xy[1]][xy[0]],
				x1: NaN,
				y1: NaN,
				xy1: NaN
			}
		// can be set logic
		, validDrop = validateDrop.call(this, posMap, piece)

	if (validDrop) {
		// todo set correct positioning of complex pieces
		this.__model.state[posMap.y0][posMap.x0] = piece.__model.value[0]

		if (piece.length === 2) {
			this.__model.state[posMap.y1][posMap.x1] = piece.__model.value[1]
		}
	}

	return validDrop
}

/**
 * 
 */
function crawlFromPosition (val, origin) {
	var row = origin[0]
		, nextRow = row + 1
		, col = origin[1]
		, nextCol = col + 1
		, prevCol = col - 1
		, positions = [[row, col]]

	if (nextCol < this.__model.colLimit) {
		if (this.__model.state[row][nextCol] === val) {
			positions = positions.concat(crawlFromPosition.call(this, val, [row, nextCol]))
		}
	}

	if (nextRow < this.__model.rowLimit) {
		if (this.__model.state[nextRow][col] === val) {
			positions = positions.concat(crawlFromPosition.call(this, val, [nextRow, col]))
		}
	}

	return positions
}

/**
 * 
 */
BoardView.prototype.checkForMerges = function (xyOrigin) {
	var state = this.__model.state

  for (var rowkey = 0; rowkey < this.__model.rowLimit; rowkey++) {
  	var row = state[rowkey]

	  for (var colkey = 0; colkey < this.__model.colLimit; colkey++) {
	  	var sqr = row[colkey]

	  	if (sqr !== 0) {
	  		var toBeMerged = crawlFromPosition.call(this, sqr, [rowkey, colkey]) // todo: is col, row correct or reversed?

	  		if (toBeMerged.length >= 3) {
	  			console.log('merge', toBeMerged);
	  			// toBeMerged.forEach(function (argument) {
	  			// 	// body...
	  			// })
	  			break
	  		}
	  	}
	  }
  }

	return this
}