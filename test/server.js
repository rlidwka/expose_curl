
require('http').createServer(function(req, res) {
	setTimeout(function() {
		res.write('hello-')
		req.on('data', function(d) {
			res.write(d.toString('hex') + '-')
		})
		req.on('end', function() {
			res.end('bye-')
		})
	}, 10)
}).listen(55502)

