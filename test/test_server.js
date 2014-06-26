var assert = require('assert')

require('../').catch_incoming_http(function(ee) {
	require('../').request_to_curl(ee, console.log)
})

require('./server')

require('http').request({
	host: 'localhost',
	port: '55502',
	path: '/foo',
	method: 'post',
}, function(res) {
	var data = ''
	res.setEncoding('utf8')
	res.on('data', function(d) {
		data += d
	})
	res.on('end', function() {
		assert.equal(data, 'hello-74657374-bye-')
		console.log('ok')
		process.exit()
	})
}).end('test')

