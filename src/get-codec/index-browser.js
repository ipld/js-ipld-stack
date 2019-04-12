const cache = {}

/* temp getFormat until the real one is implemented */
const getCodec = async codec => {
  if (cache[codec]) return cache[codec]
  let resolve = mod => {
    cache[codec] = mod.default
    return cache[codec]
  }
  if (codec === 'dag-cbor') {
    cache[codec] = import('../dag-cbor').then(resolve)
  }
  if (codec === 'dag-json') {
    cache[codec] = import('../dag-json').then(resolve)
  }
  if (codec === 'raw') {
    // inline raw, it's very small.
    cache[codec] = require('../raw')
  }
  if (cache[codec]) return cache[codec]
  else throw new Error(`Unknown codec ${codec}`)
}

module.exports = getCodec
module.exports.setCodec = codec => cache[codec.codec] = codec

