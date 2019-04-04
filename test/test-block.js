const Block = require('../src/block')
const cbor = require('../src/dag-cbor')
const { test } = require('tap')

test('Block encode', async t => {
  let block = Block.from({ hello: 'world' }, 'dag-cbor')
  let encoded = await block.data()
  t.ok(Buffer.isBuffer(encoded))
  t.same(encoded, await cbor.encode({ hello: 'world' }))
})

test('Block data caching', async t => {
  let block = Block.from({ hello: 'world' }, 'dag-cbor')
  let encoded = await block.data()
  encoded.test = true
  t.ok((await block.data()).test)
})

test('Block decode', async t => {
  let data = await cbor.encode({ hello: 'world' })
  let block = Block.from(data, 'dag-cbor')
  let decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
  block = Block.from({ hello: 'world' }, 'dag-cbor')
  decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
  // test data caching
  decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
})

test('Block cid', async t => {
  let block = Block.from({ hello: 'world' }, 'dag-cbor')
  let cid = await block.cid()
  t.same(cid.toBaseEncodedString(), 'zdpuAtX7ZibcWdSKQwiDCkPjWwRvtcKCPku9H7LhgA4qJW4Wk')
  block = Block.from({ hello: 'world' }, 'dag-cbor', 'sha1')
  cid = await block.cid()
  t.same(cid.toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  block = Block.create(await block.data(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same((await block.cid()).toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same(block.codec, 'dag-cbor')
  block = Block.create(await block.data(), cid)
  t.same((await block.cid()).toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same(block.codec, 'dag-cbor')
})
