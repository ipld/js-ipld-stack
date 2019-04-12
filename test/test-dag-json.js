const Block = require('../src/block')
const { test } = require('tap')

test('encode decode', async t => {
  let block = Block.encoder({ hello: 'world' }, 'dag-json')
  t.same(JSON.parse((await block.encode()).toString()), { hello: 'world' })
  let cid = await block.cid()
  let o = { link: cid, buffer: Buffer.from('asdf') }
  block = Block.encoder(o, 'dag-json')
  let block2 = Block.decoder(await block.encode(), 'dag-json')
  t.same(await block2.decode(), o)
})

test('circular failure', async t => {
  let o1 = { hello: 'world' }
  let o2 = { o1 }
  o1.o2 = o2
  let block = Block.encoder(o2, 'dag-json')
  try {
    await block.decode()
    t.ok(false)
  } catch (e) {
    t.same(e.message, 'Object contains circular references.')
  }
})
