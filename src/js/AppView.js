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
    pieceX: NaN,
    pieceY: NaN,
    pieceOffsetX: NaN,
    pieceOffsetY: NaN,

    isDragging: false,
  }

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

  this.body.addEventListener('mousemove', this.handleMoveEvent.bind(this))
}

/**
 * 
 */
AppView.prototype.handleDragEvent = function (e) {
  e.preventDefault()

  var pieceCount = this.__model.currentPiece.__model.value.length
    , ex  = e.offsetX
    , ey  = e.offsetY
    , px0 = CONFIG.PIECE.X[pieceCount]
    , py0 = CONFIG.PIECE.Y
    , px1 = px0 + (pieceCount === 1 ? CONFIG.PIECE.SIZE : CONFIG.PIECE.SIZE * 2 + CONFIG.PIECE.MARGIN)
    , py1 = py0 + CONFIG.PIECE.SIZE
    , isOverPiece = px0 < ex && py0 < ey && ex < px1 && ey < py1

  if (isOverPiece) {
    this.__model.isDragging = true

    this.__model.pieceOffsetX = ex - px0
    this.__model.pieceOffsetY = ey - py0

    this.draw()
  }

  return this
}

/**
 * 
 */
AppView.prototype.handleReleaseEvent = function (e) {
  e.preventDefault()
  
  this.__model.isDragging = false

  this.__model.pieceX = CONFIG.PIECE.X[this.__model.currentPiece.length]
  this.__model.pieceY = CONFIG.PIECE.Y

  this.draw()

  return this
}

/**
 * 
 */
AppView.prototype.handleMoveEvent = function (e) {

  if (this.__model.isDragging) {
    this.__model.pieceX = e.offsetX - this.__model.pieceOffsetX
    this.__model.pieceY = e.offsetY - this.__model.pieceOffsetY
  }

  return this
}

/**
 * Deletes last game, if it exists, gets first piece in new game
 * 
 * @return {AppView}
 */
AppView.prototype.startGame = function() {

  var piece = new PieceView(getPieceFilter(this))

  this.__model.pieceX = CONFIG.PIECE.X[piece.length]
  this.__model.pieceY = CONFIG.PIECE.Y

  this.__model.currentPiece = piece

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
        var piece = _app.__model.currentPiece.__model.value

        // clear stage
        _app.context.fillStyle = CONFIG.STAGE.BACKGROUND
        _app.context.fillRect(0, 0, CONFIG.STAGE.WIDTH, CONFIG.STAGE.HEIGHT)

        // draw piece
        piece.forEach(function (val, key) {
          var pieceX = _app.__model.pieceX + ((CONFIG.PIECE.SIZE + CONFIG.PIECE.MARGIN) * key)
            , pieceY = _app.__model.pieceY
            , textX  = pieceX + CONFIG.PIECE.TEXT.OFFSET.X
            , textY  = pieceY + CONFIG.PIECE.TEXT.OFFSET.Y

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