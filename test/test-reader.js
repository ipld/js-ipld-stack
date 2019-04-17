const Block = require('../src/block')
const CID = require('cids')
const { it } = require('mocha')
const assert = require('assert')
const tsame = require('tsame')

const same = (...args) => assert.ok(tsame(...args))
const test = it

const link = new CID('zdpuAtX7ZibcWdSKQwiDCkPjWwRvtcKCPku9H7LhgA4qJW4Wk')

const fixture = {
  n: null,
  a: ['0', 1, link, {}, { n: null, l: link }],
  o: {
    n: null,
    l: link
  },
  l: link
}

const getReader = () => Block.encoder(fixture, 'dag-cbor').reader()

test('get path', async () => {
  let reader = await getReader()
  let one = reader.get('/a/1').value
  same(one, 1)
  let incomplete = reader.get('l/one/two')
  same(incomplete.remaining, 'one/two')
  assert.ok(CID.isCID(incomplete.value))
})

test('links', async () => {
  let reader = await getReader()
  let links = Array.from(reader.links())
  let keys = links.map(a => a[0])
  same(keys, [ 'a/2', 'a/4/l', 'l', 'o/l' ])
  links.forEach(l => assert.ok(CID.isCID(l[1])))
})

test('tree', async () => {
  let reader = await getReader()
  let tree = Array.from(reader.tree())
  same(tree, [
    'a',
    'a/0',
    'a/1',
    'a/2',
    'a/3',
    'a/4',
    'a/4/l',
    'a/4/n',
    'l',
    'n',
    'o',
    'o/l',
    'o/n'
  ])
})
