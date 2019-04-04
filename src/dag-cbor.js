const _cbor = require('ipld-dag-cbor')
const codec = require('./codec-interface')
const { promisify } = require('util')

const encode = promisify(_cbor.util.serialize)
const decode = promisify(_cbor.util.deserialize)

module.exports = codec.create(encode, decode, 'dag-cbor')
