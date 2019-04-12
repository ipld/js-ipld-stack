# EXPERIMENTAL: New stack for authoring IPLD data structures

This repository is an exporatory space to work on the next stack of modules for authoring
IPLD data structures.

Eventually this repository will be deleted as it contains code for **many** modules. This
code will eventually migrate to the right repositories but it's much easier to develop
and test the stack as a whole in one repository during this early stage of development.

## Goals

After having spent time authoring IPLD data structures we have several improvements and
changes we'd like to see implemented.

* Single end point for authoring a block (rather than finding each format)
* Lazy encoding, decoding, and cid (hash) creation.
* Caching everywhere possible: encoding, hashing, etc.
* Simplified authoring of new formats.
* Less verbose API names.

# Block API

The `Block` API is the single endpoint for authoring IPLD data structures. Unless you're
implementing a new codec you can get everything you need from the Block API: encoding, 
decoding, cid creation w/ hashing.

## `Block.encoder(object, codec, algorithm = 'sha2-256')`

Create a Block instance from either a native object.

The `cid` as well as encoding will not happen until requested
and then will be cached when appropriate.

```javascript
let block = Block.encoder({hello: 'world'}, 'dag-cbor')
```

Returns a `Block` instance.

## `Block.decoder(binary, codec, algorithm = 'sha2-256')`

Create a Block instance from an existing binary encoded block

The `cid` as well as decoding will not happen until requested
and then will be cached when appropriate.

```javascript
let block = Block.decoder(someBuffer, 'dag-cbor')
```

Returns a `Block` instance.

## `Block.create(binary, cid)`

Create a new block from the raw binary data and cid.

`cid` can be an instance of `CID` or a base encoded string of a cid.

Returns a `Block` instance.

## `Block(opts)`

Once a block instance is created the information represented in the block is considered
immutable.

### `block.decode()`

Promise that resolves to a native JavaScript object decoded from the block data.

A new object is returned on every call. The decoding is not cached because it is
likely to be mutated by the consumer.

### `block.cid()`

Promise that resolves to a `cid` instance. Cached after creation.

### `block.encode()`

Promise that resolves to a `Buffer` instance encoded from the source input.

### `block.reader()`

Returns an instance of `Reader()` from the codec implementation.

## Hot path methods

We expose a few extra APIs you can use if you find IPLD in the hot paths of your own code.

Since *some* codecs require async work and some do not, it's a good idea to try and factor
our unnecesary async operations when you can if you can in hot paths.

## `block.encodeMaybeSync`

Just like `block.encode` but returns *either* a promise or the encoded value synchronously.

## `block.decodeMaybeSync`

Just like `block.decode` but returns *either* a proimse or the decoded value synchronously.

# Codec Interface

This is the primary interface for implementing new codecs.

The interface is quite simple:

```
{
  encode: Function,
  decode: Function,
  codec: String,
  reader: Function
}
```

## encode & decode

These are the primary methods you need to implement in order to implement a new codec.

While you *can* implement the entire `Reader` interface yourself, you can actually leverage 
our `codec-interface.create` utility to get a full implementation with these methods alone.

* `encode` takes a native JavaScript object and returns a binary encoding.
* `decode` takes a binary encoding and returns a nativfe JavaScript object.

Methods can be either synchronous or asynchronous (returns a promise).

## reader(block)

The reader function accepts a `Block` instance and returns a full `Reader` interface.

This method can be either synchronous or asynchronous (returns a promise).

## `codec-interface.create(encode, decode, codecName)`

Returns a full `Codec Interface` based on your encode and decode implementations.

## Reader()

### Reader.get(path)

### Reader.links()

### Reader.tree()


