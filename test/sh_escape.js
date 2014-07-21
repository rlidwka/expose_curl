var assert = require('assert')
var escape = require('../')._shell_escape

// DEL character is non-printable
assert.equal(escape('\x7f'), "$'\\x7f'")
assert.equal(escape(new Buffer([0x7f])), "$'\\x7f'")

// anything below 0x20 is unprintable
assert.equal(escape('\x1f'), "$'\\x1f'")
assert.equal(escape(new Buffer([0x1f])), "$'\\x1f'")

// anything above 0x7f is unprintable
assert.equal(escape(new Buffer([0xaa])), "$'\\xaa'")

// silently eat \x00 characters - bash don't support them
assert.equal(escape('\x00'), "$''")
assert.equal(escape(new Buffer([0])), "$''")

// unicode
assert.equal(escape('\u0391'), "$'\\xce\\x91'")
assert.equal(escape(new Buffer([0xce, 0x91])), "$'\\xce\\x91'")

// bad unicode
assert.equal(escape(new Buffer([0xce, 0xce])), "$'\\xce\\xce'")

// multiple characters
assert.equal(escape(new Buffer([0x30, 0x31, 0xff, 0x32, 0x33])), "$'01\\xff23'")

// these don't need to be escaped
assert.equal(escape('Az_-09/:.'), 'Az_-09/:.')
assert.equal(escape(new Buffer('Az_-09/:.')), 'Az_-09/:.')

// these always do
assert.equal(escape('!'), "'!'")
assert.equal(escape('\\'), "'\\'")
assert.equal(escape('\''), "\\'")
assert.equal(escape('\"'), "'\"'")
assert.equal(escape('\$'), "'$'")
assert.equal(escape('\&'), "'&'")

// empty string must be escaped
assert.equal(escape(''), '""')
assert.equal(escape(new Buffer(0)), '""')

// single quote can't be escaped in bash, so replace it with '\''
assert.equal(escape("!foo'bar$"), "'!foo'\\''bar$'")
assert.equal(escape("'bar$"), "\\''bar$'")
assert.equal(escape("!foo'"), "'!foo'\\'")
assert.equal(escape("'''"), "\\'\\'\\'")
assert.equal(escape("'foo'"), "\\''foo'\\'")
assert.equal(escape(new Buffer([0x27, 0x27, 0x27])), "\\'\\'\\'")

console.log('ok')

