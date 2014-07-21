var ClientRequest = require('http').ClientRequest
  , Server        = require('http').Server
  , EventEmitter  = require('events').EventEmitter
  , util          = require('util')

module.exports.catch_outgoing_http = function(callback) {
	function get_ee() {
		if (!this._expose_curl_ee) {
			this._expose_curl_ee = new EventEmitter()
			callback(this._expose_curl_ee)

			var headers = {}
			for (var h in this._headers) {
				headers[this._headerNames[h]] = this._headers[h]
			}
			this._expose_curl_ee.emit('request', this.method, this.path, headers)
		}
		return this._expose_curl_ee
	}

	var old_write = ClientRequest.prototype.write
	ClientRequest.prototype.write = function(data, encoding) {
		old_write.apply(this, arguments)
		get_ee.call(this).emit('data', data, encoding)
	}

	var old_end = ClientRequest.prototype.end
	ClientRequest.prototype.end = function() {
		old_end.apply(this, arguments)
		get_ee.call(this).emit('end')
	}
}

module.exports.catch_incoming_http = function(callback) {
	var old_al = Server.prototype.addListener
	Server.prototype.addListener = Server.prototype.on = function(event, listener) {
		if (event === 'request' && !this._expose_curl_req) {
			this._expose_curl_req = 1
			old_al.call(this, 'request', request_listener)
		}
		old_al.apply(this, arguments)
	}

	function request_listener(req, res) {
		var ee = new EventEmitter()
		callback(ee)

		var old_emit = req.emit
		req.emit = function(event, data) {
			old_emit.apply(this, arguments)
			if (event === 'data') {
				ee.emit(event, data, this._readableState.encoding)
			} else if (event === 'end') {
				ee.emit('end')
			}
		}
		ee.emit('request', req.method, req.url, req.headers)
	}
}

module.exports._shell_escape = function(data) {
	if (!data.toString('utf8').match(/^[\040-\176]*$/)) {
		// the data is binary
		if (!Buffer.isBuffer(data)) data = new Buffer(data, 'utf8')

		var result = ''
		for (var i=0; i<data.length; i++) {
			if (data[i] === 0) {
				// do nothing... bash doesn't support null character
			} else if (data[i] >= 040 && data[i] <= 0176) {
				result += String.fromCharCode(data[i])
			} else {
				result += '\\x' + data[i].toString(16)
			}
		}

		return "$'" + result + "'"
	} else {
		// the data is ascii
		data = data.toString('utf8')

		// special case: empty string
		if (data.length === 0) return '""'

		if (data.match(/^[A-Za-z0-9/:._-]+$/)) {
			return data
		}

		// replace single quotes with '\''
		data = "'" + data.replace(/'/g, "'\\''") + "'"

		// get rid of empty substrings
		data = data.replace(/''\\'/g, "\\'")
		data = data.replace(/\\'''/g, "\\'")

		return data
	}
}

module.exports._format_curl = function(method, path, headers, data) {
	var host = 'localhost'
	var result = ''
	var escape = module.exports._shell_escape

	if (method.toUpperCase() !== 'GET') result += ' -X ' + escape(method)
	for (var k in headers) {
		if (k.toLowerCase() === 'host') host = headers[k]
		result += " -H " + escape(k + ': ' + headers[k])
	}
	if (data != null) {
		result += " -d " + escape(data)
	}
	return 'curl -i ' + escape('http://' + host + path) + result
}

module.exports.request_to_curl = function(ee, callback) {
	var headers = {}, path = '/', method = 'GET', data = []
	ee.on('request', function(m, p, h) {
		method = m
		path = p
		headers = h
	})
	ee.on('data', function(d, enc) {
		if (!Buffer.isBuffer(d)) {
			d = new Buffer(d, enc)
		}
		data.push(d)
	})
	ee.on('end', function() {
		var str = module.exports._format_curl(
			method, path, headers, (data.length ? Buffer.concat(data) : null)
		)
		callback(str)
	})
}

