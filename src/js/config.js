var _stageWidth = 320
	, _stageHeight = 480
	, _pieceSize = 50
	, _margin = 6
	, _boardWidth = (_pieceSize * 5 + _margin * 4)
	, _boardX = _stageWidth / 2 - (_boardWidth / 2)

var CONFIG = {
	PIECE: {
		SIZE: _pieceSize,
		MARGIN: _margin,
		COLOR: {
			0: '#BAD6E5',
			1: '#B1ADE5',
			2: '#B1EED5',
			3: '#B0661E',
			4: '#FE11A5',
			5: '#bada55',
			6: '#F1ED6E',
			7: '#100FA5'
		},
		X: _stageWidth / 2,
		Y: 400,

		TEXT: {
			OFFSET: {
				X: _pieceSize / 2,
				Y: _pieceSize / 2 + 8
			},
			FONT: "bold 24px sans-serif",
			COLOR: "rgba(255, 255, 255, .8)",
			ALIGN: "center"
		}
	},
	BOARD: {
		X: _boardX,
		Y: _boardX * 1.619,
		WIDTH: _boardWidth,
		HEIGHT: _boardWidth
	},
	STAGE: {
		BACKGROUND: '#FFF',
		WIDTH: _stageWidth,
		HEIGHT: _stageHeight
	}
}