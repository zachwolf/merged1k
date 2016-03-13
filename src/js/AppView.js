/**
 * Creates a filter function based on the AppView model state
 * @param  {AppView} _app - reference to the current app instance
 * @return {Function} - filter function to be used by PiecesView
 */
function getPieceFilter (_app) {
  var highest     = _app.board.getHighestValue()
    , numberLimit = !~~highest ? 2 : highest

  return function (possibleList) {
    return possibleList.filter(function (possible) {
      return possible.length === 1 ?
               possible[0] <= numberLimit :
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
 * 
 * @return {[type]} [description]
 */
AppView.prototype.bindEvents = function () {
  this.canvas.addEventListener('mousedown', this.handleHoldEvent.bind(this))

  this.body.addEventListener('mouseup', this.handleReleaseEvent.bind(this))

  this.body.addEventListener('mousemove', this.handleMoveEvent.bind(this))

  this.canvas.addEventListener('click', this.handleClickEvent.bind(this))
}

/**
 * 
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

  if (isOverPiece) {
    this.__model.isDragging = true

    this.__model.currentPiece.__model.x = e.offsetX
    this.__model.currentPiece.__model.y = e.offsetY
    this.__model.currentPiece.__model.offset.x = ex - px0
    this.__model.currentPiece.__model.offset.y = ey - py0

    this.draw()
  }

  return this
}

/**
 * 
 */
AppView.prototype.handleReleaseEvent = function (e) {
  e.preventDefault()
  
  var rowCol = this.board.getRowColumn({
    x: this.__model.currentPiece.get('x'),
    y: this.__model.currentPiece.get('y')
  })

  if (rowCol && this.board.trySet(rowCol, this.__model.currentPiece)) {
    // XXX
    delete this.__model.currentPiece
    this.__model.currentPiece = new PieceView(getPieceFilter(this))
  } else {
    this.__model.currentPiece.resetPosition()
  }

  this.__model.isDragging = false

  this.draw()

  return this
}

/**
 * 
 */
AppView.prototype.handleMoveEvent = function (e) {

  if (this.__model.isDragging) {
    this.__model.currentPiece.__model.x = e.offsetX
    this.__model.currentPiece.__model.y = e.offsetY

    this.__model.hasMoved = true
  }


  return this
}

/**
 * 
 */
AppView.prototype.handleClickEvent = function (e) {
  e.preventDefault()

  if (!this.__model.hasMoved) {
    this.__model.currentPiece.rotate()
  }

  this.__model.hasMoved = false
  
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
   * [_draw description]
   * @return {[type]} [description]
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