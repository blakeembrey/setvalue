import { describe, bench, expect, BenchOptions } from "vitest";
import type { Key, Path } from "./index.js";

const obj = { a: { b: { c: { d: 1 } } } };
const options: BenchOptions = { iterations: 250_000 };

describe("construct and use", () => {
  const getters = {
    builder: () => builderGet("a", "b", "c", "d"),
    newFunction: () => newFunctionGet("a", "b", "c", "d"),
    loop: () => loopGet("a", "b", "c", "d"),
    cache: () => cacheGet("a", "b", "c", "d"),
    hybrid: () => hybridGet("a", "b", "c", "d"),
  };

  for (const [name, get] of Object.entries(getters)) {
    bench(name, () => expect(get()(obj)).toBe(1), options);
  }
});

describe("repeated use", () => {
  const getters = {
    builder: builderGet("a", "b", "c", "d"),
    newFunction: newFunctionGet("a", "b", "c", "d"),
    loop: loopGet("a", "b", "c", "d"),
    cache: cacheGet("a", "b", "c", "d"),
    hybrid: hybridGet("a", "b", "c", "d"),
  };

  for (const [name, getter] of Object.entries(getters)) {
    bench(name, () => expect(getter(obj)).toBe(1), options);
  }
});

describe("single get", () => {
  const getters = {
    builder: builderGet("a"),
    newFunction: newFunctionGet("a"),
    loop: loopGet("a"),
    cache: cacheGet("a"),
    hybrid: hybridGet("a"),
  };

  for (const [name, getter] of Object.entries(getters)) {
    bench(name, () => expect(getter(obj)).toBe(obj.a), options);
  }
});

function builderGet<P extends Path>(...path: P) {
  let pos = path.length;
  if (pos === 0) throw new TypeError("Path cannot be empty");

  let fn = getter(path[--pos]);
  while (pos) fn = $getter(fn, path[--pos]);
  return fn as any;
}

type Getter = (obj: object) => unknown;

function getter(key: Key): Getter {
  return (obj) => obj[key];
}

function $getter(fn: Getter, key: Key): Getter {
  return (obj) => (isObject(obj[key]) ? fn(obj[key]) : undefined);
}

function newFunctionGet<P extends Path>(...path: P) {
  if (path.length === 0) throw new TypeError("Path cannot be empty");

  return new Function(`return (obj) => ${getBody(path)}`)();
}

function getBody(path: Path): string {
  const [key, ...rest] = path;
  const prop = JSON.stringify(key);
  if (rest.length === 0) {
    return `obj[${prop}]`;
  }
  return `(typeof obj[${prop}] === "object" ? (obj = obj[${prop}]) : undefined) && ${getBody(
    rest,
  )}`;
}

function loopGet<P extends Path>(...path: P) {
  const lastIndex = path.length - 1;
  if (lastIndex === -1) throw new TypeError("Path cannot be empty");

  return (obj: any) => {
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      if (!isObject(obj[key])) return undefined;
      obj = obj[key];
    }
    return obj[path[lastIndex]];
  };
}

function cacheGet<P extends Path>(...path: P) {
  if (path.length === 0) throw new TypeError("Path cannot be empty");

  return (CACHE[path.length - 1] as any)(...path);
}

const CACHE = [
  (key1: Key) => (obj: object) => obj[key1],
  (key1: Key, key2: Key) => (obj: object) =>
    (typeof obj[key1] === "object" ? (obj = obj[key1]) : undefined) &&
    obj[key2],
  (key1: Key, key2: Key, key3: Key) => (obj: object) =>
    (typeof obj[key1] === "object" ? (obj = obj[key1]) : undefined) &&
    (typeof obj[key2] === "object" ? (obj = obj[key2]) : undefined) &&
    obj[key3],
  (key1: Key, key2: Key, key3: Key, key4: Key) => (obj: object) =>
    (typeof obj[key1] === "object" ? (obj = obj[key1]) : undefined) &&
    (typeof obj[key2] === "object" ? (obj = obj[key2]) : undefined) &&
    (typeof obj[key3] === "object" ? (obj = obj[key3]) : undefined) &&
    obj[key4],
];

function hybridGet<P extends Path>(...path: P) {
  const lastIndex = path.length - 1;
  if (lastIndex === -1) throw new TypeError("Path cannot be empty");
  const getter = $get(path[lastIndex]);
  if (lastIndex === 0) return getter;

  return (obj: any) => {
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      if (!isObject(obj[key])) return undefined;
      obj = obj[key];
    }
    return getter(obj);
  };
}

function $get(key: Key) {
  return (obj: any) => obj[key];
}

const isObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null;
