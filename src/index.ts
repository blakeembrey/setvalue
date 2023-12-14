export type Key = PropertyKey;
export type Path = Key[];

/**
 * Build a valid object shape for a given path.
 */
export type ValidObject<P extends Path> = P extends []
  ? never
  : P extends [infer K extends Key]
    ? { [P in K]?: unknown }
    : P extends [infer K extends Key, ...infer R extends Path]
      ? { [P in K]?: ValidObject<R> | unknown }
      : never;

/**
 * Get the value type for a given path in an object.
 */
export type GetValue<T, P extends Path, F = undefined> = T extends object
  ? P extends [infer K extends keyof T]
    ? T[K]
    : P extends [infer K extends keyof T, ...infer R extends Path]
      ? GetValue<T[K], R, F>
      : never
  : F;

/**
 * Create a setter function for a given path.
 */
export function set<P extends Path>(
  ...path: P
): <T extends ValidObject<P>, V extends GetValue<T, P, never>>(
  obj: T,
  value: V,
) => V {
  const len = path.length - 1;
  if (len === -1) throw new TypeError("Path cannot be empty");

  return (obj: any, value: any) => {
    for (let i = 0; i < len; i++) {
      const key = path[i];
      obj = isObject(obj[key]) ? obj[key] : (obj[key] = {});
    }
    return (obj[path[len]] = value);
  };
}

/**
 * Create a check function for a given path.
 */
export function has<P extends Path>(
  ...path: P
): (obj: ValidObject<P>) => boolean {
  const len = path.length - 1;
  if (len === -1) throw new TypeError("Path cannot be empty");

  return (obj: any) => {
    for (let i = 0; i < len; i++) {
      const key = path[i];
      if (!isObject(obj[key])) return false;
      obj = obj[key];
    }
    return path[len] in obj;
  };
}

/**
 * Create a getter function for a given path.
 */
export function get<P extends Path>(
  ...path: P
): <T extends ValidObject<P>>(obj: T) => GetValue<T, P> {
  const len = path.length - 1;
  if (len === -1) throw new TypeError("Path cannot be empty");

  return (obj: any) => {
    for (let i = 0; i < len; i++) {
      const key = path[i];
      if (!isObject(obj[key])) return undefined;
      obj = obj[key];
    }
    return obj[path[len]];
  };
}

const isObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null;
