const Block = require('../src/block')
const { it } = require('mocha')
const assert = require('assert')
const tsame = require('tsame')

const same = (...args) => assert.ok(tsame(...args))
const test = it

test('encode decode', async () => {
  let block = Block.encoder({ hello: 'world' }, 'dag-json')
  same(JSON.parse((await block.encode()).toString()), { hello: 'world' })
  let cid = await block.cid()
  let o = { link: cid, buffer: Buffer.from('asdf') }
  block = Block.encoder(o, 'dag-json')
  let block2 = Block.decoder(await block.encode(), 'dag-json')
  same(await block2.decode(), o)
})

test('circular failure', async () => {
  let o1 = { hello: 'world' }
  let o2 = { o1 }
  o1.o2 = o2
  let block = Block.encoder(o2, 'dag-json')
  try {
    await block.decode()
    assert.ok(false)
  } catch (e) {
    same(e.message, 'Object contains circular references.')
  }
})
