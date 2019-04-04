const _codec = require('../src/codec-interface')
const CID = require('cids')
const { test } = require('tap')

/* very bad dag codec for testing */
const encode = async obj => {
  for (let key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = obj[key].toBaseEncodedString()
    }
  }
  let str = JSON.stringify(obj)
  return Buffer.from(str)
}
const decode = async buffer => {
  let obj = JSON.parse(buffer.toString())
  for (let key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = new CID(obj[key])
    }
  }
  return obj
}

const create = () => _codec.create(encode, decode, 'terrible-dag')

test('test create', async t => {
  create()
})

test('test encode/decode', async t => {
  let codec = create()
  let buffer = await codec.encode({ hello: 'world' })
  let obj = await codec.decode(buffer)
  t.same(obj, { hello: 'world' })
})
