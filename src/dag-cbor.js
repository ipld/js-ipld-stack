const _cbor = require('ipld-dag-cbor')
const format = require('./format')
const { promisify } = require('util')

const encode = promisify(_cbor.util.serialize)
const decode = promisify(_cbor.util.deserialize)

module.exports = format.create(encode, decode, 'dag-cbor')
