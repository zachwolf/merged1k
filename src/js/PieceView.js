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