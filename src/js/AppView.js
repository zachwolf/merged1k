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
 * 
 */

/**
 * 
 * @return {[type]} [description]
 */
AppView.prototype.startGame = function() {
  /*
  clear game model
  set a new piece
   */
  
  var highest     = this.board.getHighestValue()
    , numberLimit = !~~highest ? 2 : highest

  this.__model.currentPiece = new PieceView(function (possibleList) {
    return possibleList.filter(function (possible) {
      return possible.length === 1 ?
               possible[0] <= numberLimit :
               possible[0] <= numberLimit &&
               possible[1] <= numberLimit
    })
  })
}