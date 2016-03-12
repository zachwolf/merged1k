var _stageWidth = 320
	, _stageHeight = 480
	, _pieceSize = 50
	, _margin = 6
	, _pieceX = (_stageWidth / 2) - _pieceSize - (_margin / 2)
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
		X: _pieceX,
		Y: _pieceY,
		TEXT: {
			X: _pieceX + _pieceSize / 2,
			Y: _pieceY + (_pieceSize / 2) + 8,
			FONT: "bold 24px sans-serif",
			COLOR: "rgba(255, 255, 255, .8)",
			ALIGN: "center"
		}
	},
	BOARD: {
		X: 100,
		Y: 100
	},
	STAGE: {
		WIDTH: _stageWidth,
		HEIGHT: _stageHeight/*,
		CENTER: {
			X: _stageWidth / 2,
			Y: _stageHeight / 2
		}*/
	}
}