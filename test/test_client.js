var assert = require('assert')

require('../').catch_outgoing_http(function(ee) {
	require('../').request_to_curl(ee, console.log)
})

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

