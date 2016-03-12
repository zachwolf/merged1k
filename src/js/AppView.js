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
    isDragging: false
    // ...
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
}

/**
 * 
 */
AppView.prototype.handleDragEvent = function (e) {
  e.preventDefault()

  this.__model.isDragging = true

  this.draw()
}

/**
 * 
 */
AppView.prototype.handleReleaseEvent = function (e) {
  e.preventDefault()
  
  this.__model.isDragging = false
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
        var piece  = _app.__model.currentPiece.__model.value
          , offset = piece.length === 1 ? (CONFIG.PIECE.SIZE / 2) + (CONFIG.PIECE.MARGIN / 2) : 0

        piece.forEach(function (val, key) {
          var pieceX = (((CONFIG.PIECE.SIZE + CONFIG.PIECE.MARGIN) * key) + CONFIG.PIECE.X) + offset
            , pieceY = CONFIG.PIECE.Y
            , textX  = (((CONFIG.PIECE.SIZE + CONFIG.PIECE.MARGIN) * key) + CONFIG.PIECE.TEXT.X) + offset
            , textY  = CONFIG.PIECE.TEXT.Y

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