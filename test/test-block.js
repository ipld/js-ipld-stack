const Block = require('../src/block')
const cbor = require('../src/dag-cbor')
const { test } = require('tap')

test('Block encode', async t => {
  let block = Block.encoder({ hello: 'world' }, 'dag-cbor')
  let encoded = await block.encode()
  t.ok(Buffer.isBuffer(encoded))
  t.same(encoded, await cbor.encode({ hello: 'world' }))
})

test('Block data caching', async t => {
  let block = Block.encoder({ hello: 'world' }, 'dag-cbor')
  let encoded = await block.encode()
  encoded.test = true
  t.ok((await block.encode()).test)
})

test('Block decode', async t => {
  let data = await cbor.encode({ hello: 'world' })
  let block = Block.decoder(data, 'dag-cbor')
  let decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
  block = Block.encoder({ hello: 'world' }, 'dag-cbor')
  decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
  // test data caching
  decoded = await block.decode()
  t.same(decoded, { hello: 'world' })
})

test('Block cid', async t => {
  let block = Block.encoder({ hello: 'world' }, 'dag-cbor')
  let cid = await block.cid()
  t.same(cid.toBaseEncodedString(), 'zdpuAtX7ZibcWdSKQwiDCkPjWwRvtcKCPku9H7LhgA4qJW4Wk')
  block = Block.encoder({ hello: 'world' }, 'dag-cbor', 'sha1')
  cid = await block.cid()
  t.same(cid.toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  block = Block.create(await block.encode(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same((await block.cid()).toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same(block.codec, 'dag-cbor')
  block = Block.create(await block.encode(), cid)
  t.same((await block.cid()).toBaseEncodedString(), 'z8d8Cu56HEXrUTgRbLdkfRrood2EhZyyL')
  t.same(block.codec, 'dag-cbor')
})

const testRaw = async t => {
  let block = Block.encoder(Buffer.from('asdf'), 'raw')
  let data = await block.encode()
  t.same(data, Buffer.from('asdf'))
  block = Block.decoder(Buffer.from('asdf'), 'raw')
  data = await block.decode()
  t.same(data, Buffer.from('asdf'))
  block = Block.encoder(Buffer.from('asdf'), 'raw')
  data = await block.decode()
  console.error({ data })
  t.same(data, Buffer.from('asdf'))
}

test('raw codec', async t => {
  await testRaw(t)
})

test('async codec', async t => {
  let asyncModule = new Promise(resolve => resolve(require('../src/raw')))
  asyncModule.codec = 'raw'
  Block.getCodec.setCodec(asyncModule)
  await testRaw(t)

  const asyncRaw = {
    encode: async x => x,
    decode: async x => x,
    codec: 'raw'
  }

  Block.getCodec.setCodec(asyncRaw)
  await testRaw(t)

  let asyncRawModule = new Promise(resolve => resolve(asyncRaw))
  asyncRawModule.codec = 'raw'
  Block.getCodec.setCodec(asyncRawModule)
  await testRaw(t)
})
