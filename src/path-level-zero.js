const Block = require('./block')
const CID = require('cids')

const resolve = async (path, root, get) => {
  if (CID.isCID(root)) root = await get(root)
  if (!Block.isBlock(root)) throw new Error('root argument must be Block or CID')
  let block = root
  while (path) {
    let ret = (await block.reader()).get(path)
    if (CID.isCID(ret.value)) {
      // TODO: support inline blocks
      block = await get(ret.value)
      path = ret.remaining
    } else {
      /* this only happens if someone messes up the path resolution
       * in the code implementation
       */
      if (ret.remaining) throw new Error('invalid path resolver')
      return ret.value
    }
  }
  return block.decode()
}

const blocks = async function * (path, root, get) {
  if (CID.isCID(root)) root = await get(root)
  if (!Block.isBlock(root)) throw new Error('root argument must be Block or CID')
  let block = root
  while (path) {
    yield block
    let ret = (await block.reader()).get(path)
    if (CID.isCID(ret.value)) {
      // TODO: support inline blocks
      block = await get(ret.value)
      path = ret.remaining
    } else {
      /* this only happens if someone messes up the path resolution
       * in the code implementation
       */
      if (ret.remaining) throw new Error('invalid path resolver')
      return
    }
  }
}

const find = async (path, root, get) => {
  if (CID.isCID(root)) root = await get(root)
  if (!Block.isBlock(root)) throw new Error('root argument must be Block or CID')
  let block = root
  let _path = path
  while (path) {
    let ret = (await block.reader()).get(path)
    if (CID.isCID(ret.value)) {
      // TODO: support inline blocks
      block = await get(ret.value)
      path = ret.remaining
      _path = path
    } else {
      /* this only happens if someone messes up the path resolution
       * in the code implementation
       */
      if (ret.remaining) throw new Error('invalid path resolver')
      return { block, value: ret.value, path: _path }
    }
  }
  return { block, value: await block.decode(), path: _path }
}

exports.resolve = resolve
exports.blocks = blocks
exports.find = find
