const CID = require('cids')

const links = function * (decoded, path = []) {
  for (let key of Object.keys(decoded)) {
    let _path = path.slice()
    _path.push(key)
    let val = decoded[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          let __path = _path.slice()
          __path.push(i)
          let o = val[i]
          if (CID.isCID(o)) {
            yield [__path.join('/'), o]
          } else if (typeof o === 'object') {
            yield * links(o, __path)
          }
        }
      } else {
        if (CID.isCID(val)) {
          yield [_path.join('/'), val]
        } else {
          yield * links(val, _path)
        }
      }
    }
  }
}

const tree = function * (decoded, path = []) {
  for (let key of Object.keys(decoded)) {
    let _path = path.slice()
    _path.push(key)
    yield _path.join('/')
    let val = decoded[key]
    if (val && typeof val === 'object' && !CID.isCID(val)) {
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          let __path = _path.slice()
          __path.push(i)
          let o = val[i]
          yield __path.join('/')
          if (typeof o === 'object' && !CID.isCID(o)) {
            yield * tree(o, __path)
          }
        }
      } else {
        yield * tree(val, _path)
      }
    }
  }
}

const readonly = () => { throw new Error('Read-only property') }

class Reader {
  constructor (decoded) {
    Object.defineProperty(this, 'decoded', { get: () => decoded, set: readonly })
  }
  get (path) {
    let node = this.decoded
    path = path.split('/').filter(x => x)
    while (path.length) {
      let key = path.shift()
      if (node[key] === undefined) throw new Error(`Object has no property ${key}`)
      node = node[key]
      if (CID.isCID(node)) return { value: node, remaining: path.join('/') }
    }
    return { value: node }
  }
  links () {
    return links(this.decoded)
  }
  tree () {
    return tree(this.decoded)
  }
}

class CodecInterface {
  constructor (encode, decode, codec) {
    this.encode = encode
    this.decode = decode
    Object.defineProperty(this, 'codec', { get: () => codec, set: readonly })
  }
  async reader (block) {
    let decoded = await block.decode()
    return new Reader(decoded)
  }
}

exports.create = (encode, decode, codec) => {
  return new CodecInterface(encode, decode, codec)
}
exports.CodecInterface = CodecInterface
exports.Reader = Reader
