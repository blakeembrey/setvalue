# Setvalue

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Set a nested value from an object by path.

## Installation

```sh
npm install setvalue --save
```

## Usage

```js
import { set } from 'setvalue'

const obj = { a: 'prop' }

set(obj, ['a', 'b', 'c'], 10) //=> { a: { b: { c: 10 } } }
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/setvalue.svg?style=flat
[npm-url]: https://npmjs.org/package/setvalue
[downloads-image]: https://img.shields.io/npm/dm/setvalue.svg?style=flat
[downloads-url]: https://npmjs.org/package/setvalue
[travis-image]: https://img.shields.io/travis/blakeembrey/setvalue.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/setvalue
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/setvalue.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/setvalue?branch=master
