var ClientRequest = require('http').ClientRequest
var EventEmitter = require('events').EventEmitter
var util = require('util')

module.exports.catch_outgoing_http = function(callback) {
	function get_ee() {
		if (!this._expose_curl_ee) {
			this._expose_curl_ee = new EventEmitter()
			callback(this._expose_curl_ee)
			this._expose_curl_ee.emit('headers')
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
/*	var oldserver = _http_server.ServerResponse
	_http_server.ServerResponse = function(req) {
		console.log()
	}
	for (var x in oldserver) {
		_http_server.ServerResponse[x] = oldserver[x]
	}*/
}

