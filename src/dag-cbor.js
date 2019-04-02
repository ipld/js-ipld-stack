const _cbor = require('ipld-dag-cbor')
const interface = require('./format')
const { promisify } = require('util')

const encode = promisify(_cbor.util.serialize)
const decode = promisify(_cbor.util.deserialize)

const format = interface.create(encode, decode, 'dag-cbor')

module.exports = format
