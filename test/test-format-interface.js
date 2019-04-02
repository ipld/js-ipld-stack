const interface = require('../src/format')
const CID = require('cids')
const { test } = require('tap')

/* very bad dag format for testing */
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

const create = () => interface.create(encode, decode, 'terrible-dag')

test('test create', async t => {
  create()
})

test('test encode/decode', async t => {
  let format = create()
  let buffer = await format.encode({hello: 'world'})
  let obj = await format.decode(buffer)
  t.same(obj, {hello: 'world'})
})

