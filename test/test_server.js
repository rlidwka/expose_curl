var assert = require('assert')

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
		assert.equal(data, 'hello-bye-')
		console.log('ok')
		process.exit()
	})
}).end('test')

