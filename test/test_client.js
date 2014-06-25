var assert = require('assert')

require('http').createServer(function(req, res) {
	var data = ''
	req.setEncoding('utf8')
	req.on('data', function(d) {
		data += d
	})
	req.on('end', function() {
		assert.equal(data, 'hello-bye-')
		console.log('ok')
		process.exit()
	})
}).listen(55501)

require('./client')

