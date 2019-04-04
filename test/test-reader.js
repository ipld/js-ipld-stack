const Block = require('../src/block')
const CID = require('cids')
const { test } = require('tap')

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

test('get path', async t => {
  let reader = await getReader()
  let one = reader.get('/a/1').value
  t.same(one, 1)
  let incomplete = reader.get('l/one/two')
  t.same(incomplete.remaining, 'one/two')
  t.ok(CID.isCID(incomplete.value))
})

test('links', async t => {
  let reader = await getReader()
  let links = Array.from(reader.links())
  let keys = links.map(a => a[0])
  t.same(keys, [ 'a/2', 'a/4/l', 'l', 'o/l' ])
  links.forEach(l => t.ok(CID.isCID(l[1])))
})

test('tree', async t => {
  let reader = await getReader()
  let tree = Array.from(reader.tree())
  t.same(tree, [
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
