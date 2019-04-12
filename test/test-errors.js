const Block = require('../src/block')
const { test } = require('tap')

const tryError = async (fn, message, t) => {
  try {
    await fn()
  } catch (e) {
    t.same(e.message, message)
  }
}

test('No block options', async t => {
  await tryError(() => new Block(), 'Block options are required', t)
})

test('No data or source', async t => {
  await tryError(() => new Block({}), 'Block instances must be created with either an encode source or data', t)
})

test('source only', async t => {
  await tryError(() => new Block({ source: {} }), 'Block instances created from source objects must include desired codec', t)
})

test('data only', async t => {
  await tryError(() => new Block({ data: Buffer.from('asdf') }), 'Block instances created from data must include cid or codec', t)
})

test('set opts', async t => {
  let block = Block.encoder({}, 'dag-cbor')
  await tryError(() => { block.opts = 'asdf' }, 'Cannot set read-only property', t)
})
