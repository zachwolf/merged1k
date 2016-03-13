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
 * [getHighestValue description]
 * @return {[type]} [description]
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

    return [dropY, dropX]
  } else {
    return null
  }
}

/**
 * 
 */
// BoardView.prototype.trySet = function (xy, piece) {
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
 * 
 */
function crawlPositions (sqrs) {
  if (sqrs.length < 3) {
    return false
  }

  var sqrStr = sqrs.map(function (sqr) {
        return sqr.toString()
      })
    , pairs  = []

  // var above = not needed?
  sqrs.forEach((function (sqr) {
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

  var pairStr = pairs.map(function (pair) {
    return pair.map(function (rowCol) {
      return rowCol.toString()
    })
  })

  var group = filterGroups.call(this, pairs)

  if (!group[0] || (group[0] && group[0].length < 3)) {
    return false
  }

  // if (group && group.length && group[0].length >= 3) {
  //   var remainingPairs = pairStr.filter(function (pair) {
  //     for (var key = 0; key < pair.length; key++) {
  //       if (!!~group[0].indexOf(pair[key])) {
  //         return false
  //       }
  //     }
  //     return true
  //   })

  //   if (remainingPairs.length) {

  //     var group2 = filterGroups.call(this, remainingPairs)

  //     if (group2 && group2.length && group2[0].length >= 3) {
  //     }
  //   }

  //   return false
  // }

  return group[0].map(function (item) {
    var split = item.split(',')
    return [parseInt(split[0]), parseInt(split[1])]
  })
}

/**
 * [function_name description]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
function filterGroups (groups, _res) {
  var res = _res || []
    , possibleRes = []
    , pairStr = groups.map(function (group) {
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

      // if (otherGroups.length) {};
      return singleGroup
    }
  } else {
    return pairStr
  }

  // return res
  return newGroups
}

var limit = 10

/**
 * 
 */
BoardView.prototype.getMerges = function (rowColOrigin) {
  var state = this.__model.state
    , activeNumber = {}
    , res = {}
    // , self = this

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

  // next steps:
  // - figure out if it was a double piece being dropped
  //   if it was, figure out which piece needs to be merged on
  // 
  // - recursive merging

  // for (var valkey in activeNumber) {
  //   var toBeMerged = crawlPositions.call(this, activeNumber[valkey])

  //   if (toBeMerged) {
  //     toBeMerged.forEach(function (sqr) {
  //       if (sqr.toString() === rowColOrigin.toString()) {
  //         state[rowColOrigin[0]][rowColOrigin[1]] = state[rowColOrigin[0]][rowColOrigin[1]] + 1
  //       } else {
  //         state[sqr[0]][sqr[1]] = 0
  //       }
  //     })
  //   }
  // }

  for (var valkey in activeNumber) {
    var groups = crawlPositions.call(this, activeNumber[valkey])
    if (groups) {
      return groups
    }
  }

  return false
}



/*

var otherGroups = groups.filter(function (pos) {
        for (var singleGroupKey = 0; singleGroupKey < singleGroup.length; singleGroupKey++) {
          if (!!~pos.indexOf(singleGroup[0][singleGroupKey])) {
            return false
          }
        }

        return true
      })


 */