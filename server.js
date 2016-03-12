'use strict'

let express = require('express')
	, app = express()

// app.get('/', function (req, res) {
	
// })

app.use('/', express.static('src'))

app.listen(3232)