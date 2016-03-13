/**
 * checks that a given piece is allowed to be dropped
 * at a given point
 *
 * @param  {Object} m - hash of passed parameters
 * @param  {PieceView} piece - instance of pieceView to check
 * @return {Boolean} - drop was valid
 */
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