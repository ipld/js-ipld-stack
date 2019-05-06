const Block = require('../src/block')
const { resolve, find } = require('../src/path-level-one')
const { it } = require('mocha')
const assert = require('assert')
const tsame = require('tsame')

const same = (...args) => assert.ok(tsame(...args))
const test = it

const fixture = async () => {
  let db = new Map()
  let leaf = Block.encoder({ hello: 'world', sub: { blah: 1 }, arr: ['test'] }, 'dag-cbor')
  let raw = Block.encoder(Buffer.from('asdf'), 'raw')
  let _root = { one: { two: { three: { raw: await raw.cid(), leaf: await leaf.cid() } } } }
  let root = Block.encoder(_root, 'dag-cbor')
  for (let block of [leaf, raw, root]) {
    db.set((await block.cid()).toBaseEncodedString(), block)
  }
  return { leaf, raw, root, db, get: cid => db.get(cid.toBaseEncodedString()) }
}

test('basic find', async () => {
  let { root, get, leaf } = await fixture()
  let ret = await find('/one/two/three/leaf/hello', root, get)
  same(await leaf.cid(), await ret.block.cid())
  same(ret.value, 'world')
  same(ret.path, 'hello')
})

test('basic resolve', async () => {
  let { root, get } = await fixture()
  let ret = await resolve('/one', root, get)
  same(Object.keys(ret), ['two'])
})
