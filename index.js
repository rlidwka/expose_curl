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
			this._expose_curl_ee.emit('headers', headers)
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
		ee.emit('headers', req.headers)
	}
}

