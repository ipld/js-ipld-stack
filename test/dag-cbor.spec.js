const format = require('../src/dag-cbor')
const { it } = require('mocha')
const assert = require('assert')
const tsame = require('tsame')

const same = (...args) => assert.ok(tsame(...args))
const test = it

test('encode/decode', async () => {
  let buffer = await format.encode({ hello: 'world' })
  let obj = await format.decode(buffer)
  same(obj, { hello: 'world' })
})
