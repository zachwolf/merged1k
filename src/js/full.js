// config.js

var _stageWidth = 320
	, _stageHeight = 480
	, _pieceSize = 50
	, _margin = 6
	, _boardWidth = (_pieceSize * 5 + _margin * 4)
	, _boardX = _stageWidth / 2 - (_boardWidth / 2)

var CONFIG = {
	PIECE: {
		SIZE: _pieceSize,
		MARGIN: _margin,
		COLOR: {
			0: '#BAD6E5',
			1: '#B1ADE5',
			2: '#B1EED5',
			3: '#B0661E',
			4: '#FE11A5',
			5: '#bada55',
			6: '#F1ED6E',
			7: '#100FA5'
		},
		X: _stageWidth / 2,
		Y: 400,

		TEXT: {
			OFFSET: {
				X: _pieceSize / 2,
				Y: _pieceSize / 2 + 8
			},
			FONT: "bold 24px sans-serif",
			COLOR: "rgba(255, 255, 255, .8)",
			ALIGN: "center"
		}
	},
	BOARD: {
		X: _boardX,
		Y: _boardX * 1.619,
		WIDTH: _boardWidth,
		HEIGHT: _boardWidth
	},
	STAGE: {
		BACKGROUND: '#FFF',
		WIDTH: _stageWidth,
		HEIGHT: _stageHeight
	}
}

// boardview


function validateDrop (m, piece){
  // if first block is on an occupied piece
  if (m.rowCol0 !== 0) {
    return false
  }

  if (piece.length === 2) {
    m.row1 = m.row0 + (!!~[0,180].indexOf(piece.__model.rotation) ? 0 : 1)
    m.col1 = m.col0 + (!!~[0,180].indexOf(piece.__model.rotation) ? 1 : 0)

    // two piece is off board to bottom
    if (m.col1 >= this.__model.rowLimit) {
      return false
    }

    // two piece is off board to right
    if (m.col1 >= this.__model.colLimit) {
      return false
    }

    m.rowCol1 = this.__model.state[m.row1][m.col1]

    // if second block is on an occupied piece
    if (m.rowCol1 !== 0) {
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
 * Loops through the board to find the high current value
 *
 * @return {Number} - highest piece on board
 */
BoardView.prototype.getHighestValue = function () {
  return this.__model.state.map(function (row) {
    return row.reduce(function (prev, next) {
      return Math.max(prev, next)
    })
  }).reduce(function (prev, next) {
    return Math.max(prev, next)
  })
}

/**
 * Erases the board state
 * 
 * @return {BoardView}
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
 * Calculates a row and col on board based on x, y event coordinates
 * 
 * @param  {Object} pos
 * @param  {Number} pos.x - event x
 * @param  {Number} pos.y - event y
 * @return {Boolean|Array} - if the event is off the board, return false
 *                           otherwise, return row, col Array
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

    return [dropY, dropX]
  } else {
    return null
  }
}

/**
 * Attempts to updated the board state with a given value
 *
 * @param {Array} rowCol - position to set
 * @param {PieceView} piece - value(s) to be set
 * @param {Boolean} - whether or not the drop was successful
 */
BoardView.prototype.trySet = function (rowCol, piece) {
  var posMap = {
        row0: rowCol[0],
        col0: rowCol[1],
        rowCol0: this.__model.state[rowCol[0]][rowCol[1]],
        row1: NaN,
        col1: NaN,
        rowCol1: NaN
      }
    // can be set logic
    , validDrop = validateDrop.call(this, posMap, piece)

  if (validDrop) {
    this.__model.state[posMap.row0][posMap.col0] = piece.__model.value[0]

    if (piece.length === 2) {
      this.__model.state[posMap.row1][posMap.col1] = piece.__model.value[1]
    }
  }

  return validDrop
}

/**
 * Given a list of row, col pairs with equal values,
 * see if list items are touching in order to form mergeable blocks
 * - [1] if there are less than three sqrs, there is no possible grouping
 * - [2] find all cover rol, col arrays to strings in order to
 *       be able to check for equality of positions
 * - [3] for each sqr, check if it has neighboring sqrs that are in the
 *       passed group. 
 * - [4] convert the grouped pairs to strings to be compared with other strings
 * - [5] search groups for mergeable items
 * - [6] if the first group returned is smaller than needed for a merge, return false
 * - [7] if a full, mergeable group has been found, convert the string
 *       list of positions, back into valid numbers
 * 
 * @param {Array} sqrs - list of positions
 * @param {Array|Boolean}
 */
function crawlPositions (sqrs) {
  if (sqrs.length < 3) { // [1]
    return false
  }

  var sqrStr = sqrs.map(function (sqr) { // [2]
        return sqr.toString()
      })
    , pairs  = []

  // var above = not needed?
  sqrs.forEach((function (sqr) { // [3]
    var col   = sqr[0]
      , row   = sqr[1]
      , left  = row + 1
      , right = row + 1
      , above = col - 1
      , below = col + 1

    if (above >= 0) {
      if (!!~sqrStr.indexOf([above, row].toString())) {
        pairs.push([sqr, [above, row]])
      }
    }

    if (below < this.__model.colLimit) {
      if (!!~sqrStr.indexOf([below, row].toString())) {
        pairs.push([sqr, [below, row]])
      }
    }

    if (right < this.__model.rowLimit) {
      if (!!~sqrStr.indexOf([col, right].toString())) {
        pairs.push([sqr, [col, right]])
      }
    }

    if (left >= 0) {
      if (!!~sqrStr.indexOf([col, left].toString())) {
        pairs.push([sqr, [col, left]])
      }
    }
  }).bind(this))

  var pairStr = pairs.map(function (pair) { // [4]
    return pair.map(function (rowCol) {
      return rowCol.toString()
    })
  })

  var group = filterGroups.call(this, pairs) // [5]

  if (!group[0] || (group[0] && group[0].length < 3)) { // [6]
    return false
  }

  return group[0].map(function (item) { // [7]
    var split = item.split(',')
    return [parseInt(split[0]), parseInt(split[1])]
  })
}

/**
 * Recursively search for matchable pairs
 * 
 * @param  {Array} groups - an array of stringified col, row pairs
 * @return {Array}
 */
function filterGroups (groups) {
  var pairStr = groups.map(function (group) {
        return group.filter(function(item, pos, self) {
          return self.indexOf(item) == pos
        }).sort().toString()
      }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos
      }).map(function (item) {
        return item.match(/\d,\d/g)
      })
    , newGroups = []

  if (pairStr.length > 1) {
    pairStr.forEach(function (groupa, keya) {
      pairStr.forEach(function (groupb, keyb) {
        if (keya !== keyb) {
          if (!!~groupb.indexOf(groupa[0]) || !!~groupb.indexOf(groupa[1])) {
            newGroups.push(groupa.concat(groupb))
          }
        }
      })
    })

    if (limit >= 0) {
      limit = limit - 1

      var singleGroup = filterGroups.call(this, newGroups)

      return singleGroup
    }
  } else {
    return pairStr
  }

  return newGroups
}

var limit = 10

/**
 * Find active piece on the board, check if they have ability to merge
 *
 * @param {Array} rowColOrigin - the position to merge to
 */
BoardView.prototype.getMerges = function (rowColOrigin) {
  var state = this.__model.state
    , activeNumber = {}
    , res = {}

  state.forEach(function (row, rowkey) {
    row.forEach(function (sqr, colkey) {
      if (sqr !== 0) {
        if (!activeNumber[sqr]) {
          activeNumber[sqr] = []
        }

        activeNumber[sqr].push([rowkey, colkey])
      }
    })
  })

  for (var valkey in activeNumber) {
    var groups = crawlPositions.call(this, activeNumber[valkey])
    if (groups) {
      return groups
    }
  }

  return false
}

/**
 * Checks if the board has any two connected openings
 * 
 * @return {Boolean}
 */
BoardView.prototype.canHavePairs = function () {

  for (var rowkey = 0; rowkey < this.__model.rowLimit; rowkey++) {
    var row = this.__model.state[rowkey]
    for (var colkey = 0; colkey < this.__model.colLimit; colkey++) {
      var sqr = row[colkey]

      if (sqr === 0) {

        if (colkey + 1 < this.__model.colLimit && row[colkey + 1] === 0) {
          return true
        }

        if (rowkey + 1 < this.__model.rowLimit && this.__model.state[rowkey + 1][colkey] === 0) {
          return true
        }
      }
    }
  }

  return false
}

BoardView.prototype.hasOpenSpaces = function () {
  for (var rowkey = 0; rowkey < this.__model.rowLimit; rowkey++) {
    var row = this.__model.state[rowkey]
    for (var colkey = 0; colkey < this.__model.colLimit; colkey++) {
      var sqr = row[colkey]
      if (sqr === 0) {
        return true
      }
    }
  }
  
  return false
}

// pieceView
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
    ]),

    x: NaN,
    y: NaN,
    offset: {
      x: NaN,
      y: NaN
    },
    width: NaN,
    height: NaN,

    rotation: 0
  }

  this.setValue()

  this.length = this.__model.value.length

  this.resetPosition()
}

/**
 * Sets the board pieces value
 * 
 * @return {PieceView}
 */
PieceView.prototype.setValue = function (__seed) {
  this.__model.value = __seed || (function(p){
    return p[Math.floor(Math.random() * p.length)]
  }(this.__model.possibilities))    

  return this
}

/**
 * Moves the piece back it's origin
 * 
 * @return {PieceView}
 */
PieceView.prototype.resetPosition = function () {
  this.__model.offset.x = 0
  this.__model.offset.y = 0

  this.setPositions()
  
  return this
}

/**
 * Get a property from this model with optional logic
 *
 * @param {String} prop - property on this.__model
 * @returns {*} - value of prop
 */
PieceView.prototype.get = function (prop) {
  var model = this.__model
    , getMap = {
        x: function () {
          return model.x - model.offset.x
        },
        y: function () {
          return model.y - model.offset.y
        },
        default: function () {
          return model[prop]
        }
      }

  return getMap[prop] ? getMap[prop]() : getMap.default()
}

/**
 * Rotate orientation 90 degrees
 * 
 * @return {PieceView}
 */
PieceView.prototype.rotate = function () {

  this.__model.rotation = (this.__model.rotation + 90) % 360

  if (!!~[0, 180].indexOf(this.__model.rotation)) {
    this.__model.value.reverse()
  }

  this.setPositions()

  return this
}


/**
 * calulate model values x, y, width, and height based on model.rotation value
 * 
 * @return {PieceView}
 */
PieceView.prototype.setPositions = function () {
  var offset = this.__model.value.length === 1 ?
                 CONFIG.PIECE.SIZE / 2 :
                 CONFIG.PIECE.SIZE + (CONFIG.PIECE.MARGIN / 2)
      dSize  = this.__model.value.length === 1 ?
                 CONFIG.PIECE.SIZE :
                 CONFIG.PIECE.SIZE * 2 + CONFIG.PIECE.MARGIN

  if (!!~[90, 270].indexOf(this.__model.rotation)) {
    this.__model.x      = CONFIG.PIECE.X - CONFIG.PIECE.SIZE / 2
    this.__model.y      = CONFIG.PIECE.Y - offset
    this.__model.width  = CONFIG.PIECE.SIZE
    this.__model.height = dSize
  } else {
    this.__model.x      = CONFIG.PIECE.X - offset
    this.__model.y      = CONFIG.PIECE.Y - CONFIG.PIECE.SIZE / 2
    this.__model.width  = dSize
    this.__model.height = CONFIG.PIECE.SIZE
  }

  return this
}

// app view

/**
 * Creates a filter function based on the AppView model state
 * @param  {AppView} _app - reference to the current app instance
 * @return {Function} - filter function to be used by PiecesView
 */
function getPieceFilter (_app) {
  var highest     = _app.board.getHighestValue()
    , allowPairs  = _app.board.canHavePairs()
    , numberLimit = !~~highest ? 2 : highest

  return function (possibleList) {
    return possibleList.filter(function (possible) {
      return possible.length === 1 ?
               possible[0] <= numberLimit :
               allowPairs &&
               possible[0] <= numberLimit &&
               possible[1] <= numberLimit
    })
  }
}

/**
 * Contains all other views
 */
var AppView = function () {
  // creating child views
  this.board = new BoardView()

  // game model
  this.__model = {
    currentPiece: null,
    isDragging: false,
    hasMoved: false
  }

  // binding events
  this.bindEvents()
}

/**
 * Binds mouse interaction events
 * 
 * @return {AppView}
 */
AppView.prototype.bindEvents = function () {
  a.addEventListener('mousedown', this.handleHoldEvent.bind(this))

  b.addEventListener('mouseup', this.handleReleaseEvent.bind(this))

  b.addEventListener('mousemove', this.handleMoveEvent.bind(this))

  a.addEventListener('click', this.handleClickEvent.bind(this))

  return this
}

/**
 * Event fired when mouse is pressed and held
 * - [1] checks event occured over currentPiece
 * - [2] updates currentPiece model
 *
 * @param {Object} e - mousedown event object
 * @returns AppView
 */
AppView.prototype.handleHoldEvent = function (e) {
  e.preventDefault()

  var pieceModel = this.__model.currentPiece.__model
    , pieceCount = pieceModel.value.length
    , ex  = e.offsetX
    , ey  = e.offsetY
    , px0 = pieceModel.x
    , py0 = pieceModel.y
    , px1 = pieceModel.x + pieceModel.width
    , py1 = pieceModel.y + pieceModel.height
    , isOverPiece = px0 < ex && py0 < ey && ex < px1 && ey < py1

  if (isOverPiece) { // [1]
    this.__model.isDragging = true

    this.__model.currentPiece.__model.x = e.offsetX // [2]
    this.__model.currentPiece.__model.y = e.offsetY
    this.__model.currentPiece.__model.offset.x = ex - px0
    this.__model.currentPiece.__model.offset.y = ey - py0

    this.draw()
  }

  return this
}

/**
 * Event fired when mouse is released after dragging
 * - [1] based on mouse x and y, find the correct col, row
 * - [2] if the event was over the board, getRowColumn returns
 *       an array. Based on that array, we can try and update
 *       the board at that given postion with the currentPiece
 * - [3] if the successfully updated, loop through the board's
 *       state to search for matched groups. Continue until
 *       no more matches were found
 * - [4] update board state
 * - [5] create a new currentPiece
 * - [6] if the mouse was *not* over the board in [2],
 *       move the piece back to it's origin
 *
 * @param {Object} e - event object
 * @returns {AppView}
 */
AppView.prototype.handleReleaseEvent = function (e) {
  e.preventDefault()
  
  var rowCol = this.board.getRowColumn({ // [1]
        x: this.__model.currentPiece.get('x'),
        y: this.__model.currentPiece.get('y')
      })
    , self = this

  if (rowCol && this.board.trySet(rowCol, this.__model.currentPiece)) { // [2]
    for (var merges, mergeOrigin; merges = this.board.getMerges(rowCol); ) { // [3]
      if (merges) {
        var val = self.board.__model.state[merges[0][0]][merges[0][1]]

        mergeOrigin = rowCol

        if (self.__model.currentPiece.length === 2) {
          if (!!~[0,180].indexOf(self.__model.currentPiece.get('rotation'))) {
            if (self.__model.currentPiece.get('value')[1] === val) {
              mergeOrigin = [mergeOrigin[0], mergeOrigin[1] + 1]
            }
          } else {
            if (self.__model.currentPiece.get('value')[1] === val) {
              mergeOrigin = [mergeOrigin[0] + 1, mergeOrigin[1]]
            }
          }
        }

        merges.forEach(function (sqr) { // [4]
          if (sqr.toString() === mergeOrigin.toString()) {
            self.board.__model.state[mergeOrigin[0]][mergeOrigin[1]] = self.board.__model.state[mergeOrigin[0]][mergeOrigin[1]] + 1
          } else {
            self.board.__model.state[sqr[0]][sqr[1]] = 0
          }

          if (self.board.__model.state[sqr[0]][sqr[1]] > 7) {
            // above
            if (mergeOrigin[0] - 1 > 0) {
              if (mergeOrigin[1] - 1 > 0) {
                self.board.__model.state[mergeOrigin[0] - 1][mergeOrigin[1] - 1] = 0
              }
              if (mergeOrigin[1] + 1 < self.board.__model.colLimit) {
                self.board.__model.state[mergeOrigin[0] - 1][mergeOrigin[1] + 1] = 0
              }
              self.board.__model.state[mergeOrigin[0] - 1][mergeOrigin[1]] = 0
            }
            // below
            if (mergeOrigin[0] + 1 < self.board.__model.rowLimit) {
              if (mergeOrigin[1] - 1 > 0) {
                self.board.__model.state[mergeOrigin[0] + 1][mergeOrigin[1] - 1] = 0
              }
              if (mergeOrigin[1] + 1 < self.board.__model.colLimit) {
                self.board.__model.state[mergeOrigin[0] + 1][mergeOrigin[1] + 1] = 0
              }
              self.board.__model.state[mergeOrigin[0] + 1][mergeOrigin[1]] = 0
            }
            // left
            if (mergeOrigin[1] - 1 > 0) {
              self.board.__model.state[mergeOrigin[0]][mergeOrigin[1] - 1] = 0
            }
            // right
            if (mergeOrigin[1] + 1 < self.board.__model.colLimit) {
              self.board.__model.state[mergeOrigin[0]][mergeOrigin[1] + 1] = 0
            }
            // self
            self.board.__model.state[mergeOrigin[0]][mergeOrigin[1]] = 0
          }
        })

      } else {
        break
      }
    }

    if (!this.board.hasOpenSpaces()) {
      setTimeout((function () {
        alert('no moves left!')
        this.startGame()
      }).bind(this), 300)

    } else {
      delete this.__model.currentPiece // [5]
      this.__model.currentPiece = new PieceView(getPieceFilter(this))
    }

  } else { // [6]
    this.__model.currentPiece.resetPosition()
  }

  this.__model.isDragging = false

  this.draw()

  return this
}

/**
 * Event fired when mouse is moved anywhere on the document
 * - [1] only update the current piece model if a mousedown
 *       occured over the piece
 * - [2] set a flag to be used by click
 *
 * @param {Object} e - event object
 * @returns {AppView}
 */
AppView.prototype.handleMoveEvent = function (e) {

  if (this.__model.isDragging) { // [1]
    this.__model.currentPiece.__model.x = e.offsetX
    this.__model.currentPiece.__model.y = e.offsetY

    this.__model.hasMoved = true // [2]
  }

  return this
}

/**
 * Event fired by mouse click
 * - [1] if the mouse has *not* moved, this click should rotate
 *       the current piece
 * - [2] reset listener for next handleMoveEvent event
 *
 * @param {Object} e - event object
 * @returns {AppView}
 */
AppView.prototype.handleClickEvent = function (e) {
  e.preventDefault()

  if (!this.__model.hasMoved) { // [1]
    this.__model.currentPiece.rotate()
  }

  this.__model.hasMoved = false // [2]
  
  return this
}

/**
 * Deletes last game, if it exists, gets first piece in new game
 * 
 * @return {AppView}
 */
AppView.prototype.startGame = function() {

  this.board.reset()

  this.__model.currentPiece = new PieceView(getPieceFilter(this))

  this.draw()

  return this
}


/**
 * Draws the AppView to the canvas
 * 
 * @return {AppView}
 */
AppView.prototype.draw = (function () {

  /**
   * Loops through board, and currentPiece to reflect on screen
   * what is in the models
   */
  var _draw = function () {
        // clear stage
        c.fillStyle = CONFIG.STAGE.BACKGROUND
        c.fillRect(0, 0, CONFIG.STAGE.WIDTH, CONFIG.STAGE.HEIGHT)

        /*****************
         *   BoardView   *
         *****************/
        var board = _app.board

        board.__model.state.forEach(function (row, rowkey) {
          row.forEach(function (sqr, colkey) {
            var sqrX  = CONFIG.BOARD.X + (colkey * CONFIG.PIECE.SIZE) + (colkey * CONFIG.PIECE.MARGIN)
              , sqrY  = CONFIG.BOARD.Y + (rowkey * CONFIG.PIECE.SIZE) + (rowkey * CONFIG.PIECE.MARGIN)
              , textX = sqrX + CONFIG.PIECE.TEXT.OFFSET.X
              , textY = sqrY + CONFIG.PIECE.TEXT.OFFSET.Y

            c.fillStyle = CONFIG.PIECE.COLOR[sqr]
            c.fillRect(sqrX, sqrY, CONFIG.PIECE.SIZE, CONFIG.PIECE.SIZE)

            if (sqr !== 0) {
              c.font      = CONFIG.PIECE.TEXT.FONT
              c.fillStyle = CONFIG.PIECE.TEXT.COLOR
              c.textAlign = CONFIG.PIECE.TEXT.ALIGN

              // add text
              c.fillText(sqr, textX, textY)
            }
          })
        })

        /*****************
         *   PieceView   *
         *****************/
        var piece    = _app.__model.currentPiece
          , rotation = piece.__model.rotation
          , val      = piece.__model.value

        // debugging center of stage
        // c.beginPath()
        // c.moveTo(CONFIG.STAGE.WIDTH / 2, 0)
        // c.lineTo(CONFIG.STAGE.WIDTH / 2, CONFIG.STAGE.HEIGHT)
        // c.closePath()
        // c.stroke()

        // draw piece
        val.forEach(function (val, key) {
          var offset  = ((CONFIG.PIECE.SIZE + CONFIG.PIECE.MARGIN) * key)

            , offsetX = !!~[90, 270].indexOf(rotation) ? 0 : offset
            , pieceX  = piece.get('x') + offsetX
            , textX   = pieceX + CONFIG.PIECE.TEXT.OFFSET.X

            , offsetY = !!~[0, 180].indexOf(rotation) ? 0 : offset
            , pieceY  = piece.get('y') + offsetY
            , textY   = pieceY + CONFIG.PIECE.TEXT.OFFSET.Y

          // piece style
          c.fillStyle = CONFIG.PIECE.COLOR[val]

          // add piece
          c.fillRect(pieceX, pieceY, CONFIG.PIECE.SIZE, CONFIG.PIECE.SIZE)

          // text style
          c.font      = CONFIG.PIECE.TEXT.FONT
          c.fillStyle = CONFIG.PIECE.TEXT.COLOR
          c.textAlign = CONFIG.PIECE.TEXT.ALIGN

          // add text
          c.fillText(val, textX, textY)
        })

        // loop when dragging
        if (_app.__model.isDragging) {
          requestAnimationFrame(_draw)
        }
      }
    , _app

  return function () {
    _app = this
    _draw()

    return this
  }
}())

// app

// make it happ'n, cap'n
var app = new AppView()

app.startGame()