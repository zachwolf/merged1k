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
    currentPiece: null
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
 * Deletes last game, if it exists, gets first piece in new game
 * 
 * @return {AppView} - self reference
 */
AppView.prototype.startGame = function() {
  /*
  clear game model
  set a new piece
   */

  this.__model.currentPiece = new PieceView(getPieceFilter(this))

  return this
}