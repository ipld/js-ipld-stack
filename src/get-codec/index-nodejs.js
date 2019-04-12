const implementations = {
  'dag-cbor': require('../dag-cbor'),
  'raw': require('../raw')
}

/* temp getFormat until the real one is implemented */
const getCodec = codec => {
  if (implementations[codec]) return implementations[codec]
  else throw new Error(`Unknown codec ${codec}`)
}

module.exports = getCodec
module.exports.setCodec = codec => implementations[codec.codec] = codec

