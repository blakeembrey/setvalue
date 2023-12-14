import { describe, it, expect, expectTypeOf } from "vitest";
import { TypeOf, expectType } from "ts-expect";
import { set, has, get } from "./index.js";

describe("set", () => {
  it("should set simple value", () => {
    const obj = { a: 1 };
    set("a")(obj, 2);
    expect(obj).toEqual({ a: 2 });
  });

  it("should set nested value", () => {
    const obj = { a: { b: 1 } };
    set("a", "b")(obj, 2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should set an optional nested value", () => {
    type Obj = { a?: { b?: number } };

    const obj: Obj = {};
    set("a", "b")(obj, 2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should overwrite previous values", () => {
    type Obj = {
      a?: number | { b?: number | { c?: number | { d?: number } } };
    };

    const obj: Obj = {};

    set("a")(obj, { b: 1 });
    expect(obj).toEqual({ a: { b: 1 } });
    set("a", "b")(obj, { c: 2 });
    expect(obj).toEqual({ a: { b: { c: 2 } } });
    set("a", "b", "c")(obj, { d: 3 });
    expect(obj).toEqual({ a: { b: { c: { d: 3 } } } });
    set("a", "b", "c", "d")(obj, 4);
    expect(obj).toEqual({ a: { b: { c: { d: 4 } } } });

    set("a", "b", "c")(obj, 5);
    expect(obj).toEqual({ a: { b: { c: 5 } } });
    set("a", "b")(obj, 6);
    expect(obj).toEqual({ a: { b: 6 } });
    set("a")(obj, 7);
    expect(obj).toEqual({ a: 7 });
  });

  it("should retain existing objects", () => {
    type Obj = { nested?: { a?: number; b?: number } };
    const obj: Obj = { nested: { a: 1 } };
    expect(set("nested", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ nested: { a: 1, b: 2 } });
  });

  it("should overwrite primitives with objects", () => {
    type Obj = { a?: number | { b?: number } };
    const obj: Obj = { a: 1 };
    expect(set("a", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should overwrite null", () => {
    type Obj = { a: { b: number } | null };
    const obj: Obj = { a: null };
    expect(set("a", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should overwrite undefined", () => {
    type Obj = { a: { b: number } | undefined };
    const obj: Obj = { a: undefined };
    expect(set("a", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should overwrite null with primitive value", () => {
    type Obj = { a: { b: number | null } };
    const obj: Obj = { a: { b: null } };
    expect(set("a", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should overwrite undefined with primitive value", () => {
    type Obj = { a: { b: number | undefined } };
    const obj: Obj = { a: { b: undefined } };
    expect(set("a", "b")(obj, 2)).toBe(2);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it("should reject invalid object shapes", () => {
    type InvalidObject = { a: { b: number } | undefined };
    type ValidObject = { a: { z: string } | undefined };
    const fn = set("a", "z");

    expectType<TypeOf<Parameters<typeof fn>, [InvalidObject, string]>>(false);
    expectType<TypeOf<Parameters<typeof fn>, [ValidObject, string]>>(true);
  });
});

describe("has", () => {
  it("should return true for simple values", () => {
    const obj = { a: 1 };
    expect(has("a")(obj)).toBe(true);
  });

  it("should return true for nested values", () => {
    const obj = { a: { b: 1 } };
    expect(has("a", "b")(obj)).toBe(true);
  });

  it("should return true for undefined values", () => {
    const obj = { a: { b: undefined } };
    expect(has("a", "b")(obj)).toBe(true);
  });

  it("should return false for missing values", () => {
    type Obj = { a?: { b?: number } };
    const obj: Obj = {};
    expect(has("a", "b")(obj)).toBe(false);
  });

  it("should return true for null", () => {
    type Obj = { a?: { b?: number } | null };
    const obj: Obj = { a: null };
    expect(has("a")(obj)).toBe(true);
  });

  it("should return true for undefined", () => {
    type Obj = { a?: { b?: number } | undefined };
    const obj: Obj = { a: undefined };
    expect(has("a")(obj)).toBe(true);
  });

  it("should reject invalid object shapes", () => {
    type InvalidObject = { a: { b: number } | undefined };
    type ValidObject = { a: { z: string } | undefined };
    const fn = has("a", "z");

    expectType<TypeOf<Parameters<typeof fn>, [InvalidObject]>>(false);
    expectType<TypeOf<Parameters<typeof fn>, [ValidObject]>>(true);
  });
});

describe("get", () => {
  it("should return simple values", () => {
    const obj = { a: 1 };
    const result = get("a")(obj);
    expect(result).toBe(1);
    expectTypeOf(result).toEqualTypeOf<number>();
  });

  it("should return nested values", () => {
    const obj = { a: { b: 1 } };
    const result = get("a", "b")(obj);
    expect(result).toBe(1);
    expectTypeOf(result).toEqualTypeOf<number>();
  });

  it("should return undefined for missing values", () => {
    type Obj = { a?: { b?: number } };
    const obj: Obj = {};
    const result = get("a", "b")(obj);
    expect(result).toBe(undefined);
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  it("should handle null", () => {
    type Obj = { a: { b: number } | null };
    const obj: Obj = { a: null };

    const missing = get("a", "b")(obj);
    expect(missing).toBe(undefined);
    expectTypeOf(missing).toEqualTypeOf<number | undefined>();

    const result = get("a")(obj);
    expect(result).toBe(null);
    expectTypeOf(result).toEqualTypeOf<Obj["a"]>();
  });

  it("should handle undefined", () => {
    type Obj = { a: { b: number } | undefined };
    const obj: Obj = { a: undefined };
    const result = get("a", "b")(obj);
    expect(result).toBe(undefined);
    expectTypeOf(result).toEqualTypeOf<number | undefined>();
  });

  it("should reject invalid object shapes", () => {
    type InvalidObject = { a: { b: number } | undefined };
    type ValidObject = { a: { z: string } | undefined };
    const fn = get("a", "z");

    expectType<TypeOf<Parameters<typeof fn>, [InvalidObject]>>(false);
    expectType<TypeOf<Parameters<typeof fn>, [ValidObject]>>(true);
  });
});
