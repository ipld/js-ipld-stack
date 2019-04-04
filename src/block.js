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
    let hash = await multihashing(await this.data(), this.opts.algo)
    let cid = new CID(1, codec, hash)
    this.opts.cid = cid
    return cid
  }
  async data () {
    if (this.opts.data) return this.opts.data
    return this._encode()
  }
  get codec () {
    if (this.opts.cid) return this.opts.cid.codec
    else return this.opts.codec
  }
  async _encode () {
    if (this.opts.data) throw new Error('Cannot re-encode block that is already encoded')
    let codec = await getCodec(this.codec)
    let data = await codec.encode(this.opts.source)
    this.opts.data = data
    return data
  }
  async decode () {
    let codec = await getCodec(this.codec)
    if (!this.opts.data) {
      await this._encode()
    }
    return codec.decode(this.opts.data)
  }
  async reader () {
    let codec = await getCodec(this.codec)
    return codec.reader(this)
  }
}
Block.from = (source, codec, algo) => {
  if (Buffer.isBuffer(source)) return new Block({ data: source, codec, algo })
  else return new Block({ source, codec, algo })
}
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
