const { promisify } = require('util')
const CID = require('cids')
const multihashing = promisify(require('multihashing-async'))
const getCodec = require('./get-codec')

const readonly = value => ({ get: () => value, set: () => { throw new Error('Cannot set read-only property') } })

class Block {
  constructor (opts) {
    if (!opts) throw new Error('Block options are required')
    if (!opts.source && !opts.data) {
      throw new Error('Block instances must be created with either an encode source or data')
    }
    if (opts.source && !opts.codec) {
      throw new Error('Block instances created from source objects must include desired codec')
    }
    if (opts.data && !opts.cid && !opts.codec) {
      throw new Error('Block instances created from data must include cid or codec')
    }
    if (!opts.cid && !opts.algo) opts.algo = 'sha2-256'
    // Do our best to avoid accidental mutations of the options object after instantiation
    // Note: we can't actually freeze the object because we mutate it once per property later
    opts = Object.assign({}, opts)
    Object.defineProperty(this, 'opts', readonly(opts))
  }
  async cid () {
    if (this.opts.cid) return this.opts.cid
    let codec = this.codec
    let hash = await multihashing(await this.encode(), this.opts.algo)
    let cid = new CID(1, codec, hash)
    this.opts.cid = cid
    return cid
  }
  get codec () {
    if (this.opts.cid) return this.opts.cid.codec
    else return this.opts.codec
  }
  async encode () {
    return this.encodeMaybeSync()
  }
  encodeMaybeSync () {
    if (this.opts.data) return this.opts.data
    let codec = getCodec(this.codec)
    if (codec.then) {
      return codec.then(codec => {
        return this._encodeData(codec)
      })
    } else {
      return this._encodeData(codec)
    }
  }
  _encodeData (codec) {
    let data = codec.encode(this.opts.source)
    if (data.then) {
      data.then(data => {
        this.opts.data = data
        return data
      })
    }
    return data
  }
  async decode () {
    return this.decodeMaybeSync()
  }
  decodeMaybeSync () {
    let codec = getCodec(this.codec)
    if (codec.then) {
      return codec.then(codec => this._decodeData(codec))
    } else {
      return this._decodeData(codec)
    }
  }
  _decodeData (codec) {
    if (!this.opts.data) {
      let encoded = this.encode()
      if (encoded.then) {
        return encoded.then(() => codec.decode(this.opts.data))
      }
    }
    return codec.decode(this.opts.data)
  }
  async reader () {
    let codec = await getCodec(this.codec)
    return codec.reader(this)
  }
}
Block.encoder = (source, codec, algo) => new Block({ source, codec, algo })
Block.decoder = (data, codec, algo) => new Block({ data, codec, algo })
Block.create = (data, cid/*, validate = false */) => {
  if (typeof cid === 'string') cid = new CID(cid)
  /*
  if (validate) {
    // TODO: validate cid hash matches data
  }
  */
  return new Block({ data, cid })
}
module.exports = Block
