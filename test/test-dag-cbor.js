const { test } = require('tap')
const format = require('../src/dag-cbor')

test('encode/decode', async t => {
  let buffer = await format.encode({hello: 'world'})
  let obj = await format.decode(buffer)
  t.same(obj, {hello: 'world'})
})
