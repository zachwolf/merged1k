var _stageWidth = 320
	, _stageHeight = 480
	, _pieceSize = 50
	, _margin = 6
// , offset = piece.length === 1 ? (CONFIG.PIECE.SIZE / 2) + (CONFIG.PIECE.MARGIN / 2) : 0
	, _pieceX2 = (_stageWidth / 2) - _pieceSize - (_margin / 2)
	, _pieceX1 = _pieceX2 + (_pieceSize / 2) + (_margin / 2)
	, _pieceY = 400

var CONFIG = {
	PIECE: {
		SIZE: _pieceSize,
		MARGIN: _margin,
		COLOR: {
			1: '#B1ADE5',
			2: '#B1EED5',
			3: '#B0661E',
			4: '#FE11A5',
			5: '#bada55',
			6: '#F1ED6E',
			7: '#100FA5'
		},
		X: {
			1: _pieceX1, 
			2: _pieceX2
		},
		Y: _pieceY,
		TEXT: {
			OFFSET: {
				X: _pieceSize / 2,
				Y: _pieceSize / 2 + 8
			},
			FONT: "bold 24px sans-serif",
			COLOR: "rgba(255, 255, 255, .8)",
			// COLOR: "red",
			ALIGN: "center"
		}
	},
	BOARD: {
		X: 100,
		Y: 100
	},
	STAGE: {
		BACKGROUND: '#FFF',
		WIDTH: _stageWidth,
		HEIGHT: _stageHeight
	}
}