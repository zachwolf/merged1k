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
var AppView = function (options) {
  // save references to passed paramaters
  this.canvas  = options.canvas
  this.context = options.context
  this.body    = options.body

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
  this.canvas.addEventListener('mousedown', this.handleHoldEvent.bind(this))

  this.body.addEventListener('mouseup', this.handleReleaseEvent.bind(this))

  this.body.addEventListener('mousemove', this.handleMoveEvent.bind(this))

  this.canvas.addEventListener('click', this.handleClickEvent.bind(this))

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

    delete this.__model.currentPiece // [5]
    this.__model.currentPiece = new PieceView(getPieceFilter(this))

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
        _app.context.fillStyle = CONFIG.STAGE.BACKGROUND
        _app.context.fillRect(0, 0, CONFIG.STAGE.WIDTH, CONFIG.STAGE.HEIGHT)

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

            _app.context.fillStyle = CONFIG.PIECE.COLOR[sqr]
            _app.context.fillRect(sqrX, sqrY, CONFIG.PIECE.SIZE, CONFIG.PIECE.SIZE)

            if (sqr !== 0) {
              _app.context.font      = CONFIG.PIECE.TEXT.FONT
              _app.context.fillStyle = CONFIG.PIECE.TEXT.COLOR
              _app.context.textAlign = CONFIG.PIECE.TEXT.ALIGN

              // add text
              _app.context.fillText(sqr, textX, textY)
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
        // _app.context.beginPath()
        // _app.context.moveTo(CONFIG.STAGE.WIDTH / 2, 0)
        // _app.context.lineTo(CONFIG.STAGE.WIDTH / 2, CONFIG.STAGE.HEIGHT)
        // _app.context.closePath()
        // _app.context.stroke()

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
          _app.context.fillStyle = CONFIG.PIECE.COLOR[val]

          // add piece
          _app.context.fillRect(pieceX, pieceY, CONFIG.PIECE.SIZE, CONFIG.PIECE.SIZE)

          // text style
          _app.context.font      = CONFIG.PIECE.TEXT.FONT
          _app.context.fillStyle = CONFIG.PIECE.TEXT.COLOR
          _app.context.textAlign = CONFIG.PIECE.TEXT.ALIGN

          // add text
          _app.context.fillText(val, textX, textY)
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