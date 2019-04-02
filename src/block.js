const { promisify } = require('util')
const CID = require('cids')
const multihashing = promisify(require('multihashing-async'))

/* temp getFormat until the real one is implemented */
const getFormat = async format => {
  let module
  if (format === 'dag-cbor') {
    module = require('../formats/cbor')
  }
  return module
}

class Block {
  constructor (opts) {
    if (!opts.source && !opts.data) {
      throw new Error('Block instances must be created with either an encode source or data')
    }
    if (opts.source && !opts.format) {
      throw new Error('Block instances created from source objects must include desired format')
    }
    if (!opts.cid && !opts.algo) opts.algo = 'sha2-256'
    // Do our best to avoid accidental mutations of the options object after instantiation
    // Note: we can't actually freeze the object because we mutate it once per property later
    opts = Object.assign({}, opts)
    Object.defineProperty(this, 'opts', { get: () => opts, set: () => { throw new Error('Cannot set opts') } })
  }
  get source () {
    return this.opts.source
  }
  set source (source) {
    if (this.opts.source) throw new Error('Once set the block source is immutable')
    this.opts.source = source
  }
  async cid () {
    if (this.opts.cid) return cid
    let format = this.format
    let hash = await multihashing(await this.data(), this.opts.algo)
    let cid = new CID(1, format, hash)
    this.opts.cid = cid
    return cid
  }
  async data () {
    if (this.opts.data) return this.opts.data
    return this._encode()
  }
  get format () {
    if (this.opts.format) return this.opts.format
    if (this.opts.cid) return this.opts.cid.format
    throw new Error('Block has no associated format')
  }
  async _encode () {
    if (this.opts.data) throw new Error('Cannot re-encode block that is already encoded')
    let format = await getFormat(this.format)
    let data = await format.encode(this.source)
    this.opts.data = data
    return data
  }
  async decode () {
    let format = await getFormat(this.format)
    if (!this.opts.data) {
      await this._encode()
    }
    return format.decode(this.opts.data)
  }
}
Block.from = (source, format, algo) => new Block({source, format, algo})
Block.create = (data, cid) => new Block({data, cid})

module.exports = Block

