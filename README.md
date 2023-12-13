# Setvalue

> Type-safe library for reading, writing, or checking, nested values of an object.

## Installation

```sh
npm install setvalue --save
```

## Usage

```js
import { set, get, has } from "setvalue";

const obj = { a: "prop" };

set("a", "b", "c")(obj, 10); //=> { a: { b: { c: 10 } } }
get("a", "b", "c")(obj); //=> 10
has("a", "b", "c")(obj); //=> true
```

## License

Apache 2.0
