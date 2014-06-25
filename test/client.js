
var req = require('http').request({
	host: 'localhost',
	port: '55501',
	path: '/foo',
	method: 'post',
})

setTimeout(function() {
	req.write('hello-')
	setTimeout(function() {
		req.end('bye-')
	}, 10)
}, 10)

