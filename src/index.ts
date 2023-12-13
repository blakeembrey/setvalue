export type Segment = string | number;
export type Path = Segment[];

export type GetPath<T, P extends Path> = T extends object
  ? P extends [infer K extends keyof T]
    ? T[K]
    : P extends [infer K extends keyof T, ...infer R extends Path]
      ? GetPath<T[K], R>
      : never
  : never;

export type ValidObject<P extends Path> = P extends []
  ? never
  : P extends [infer K extends Segment]
    ? { [P in K]?: unknown }
    : P extends [infer K extends Segment, ...infer R extends Path]
      ? { [P in K]?: ValidObject<R> | unknown }
      : never;

/**
 * Create a setter function for a given path.
 */
export function set<P extends Path>(
  ...path: P
): <T extends ValidObject<P>, V extends GetPath<T, P>>(obj: T, value: V) => V {
  if (path.length === 0) throw new TypeError("Path cannot be empty");

  return new Function(`return (obj, value) => ${setBody(path)}`)();
}

function setBody(path: Path): string {
  const [key, ...rest] = path;
  const prop = JSON.stringify(key);
  if (rest.length === 0) {
    return `(obj[${prop}] = value)`;
  }
  return `(obj = typeof obj[${prop}] === "object" && obj[${prop}] || (obj[${prop}] = {})) && ${setBody(
    rest,
  )}`;
}

/**
 * Create a check function for a given path.
 */
export function has<P extends Path>(
  ...path: P
): (obj: ValidObject<P>) => boolean {
  if (path.length === 0) throw new TypeError("Path cannot be empty");

  return new Function(`return (obj) => ${hasBody(path)}`)();
}

function hasBody(path: Path): string {
  const [key, ...rest] = path;
  const prop = JSON.stringify(key);
  if (rest.length === 0) {
    return `Object.prototype.hasOwnProperty.call(obj, ${prop})`;
  }
  return `typeof obj[${prop}] === "object" && (obj = obj[${prop}]) && ${hasBody(
    rest,
  )}`;
}

/**
 * Create a getter function for a given path.
 */
export function get<P extends Path>(
  ...path: P
): <T extends ValidObject<P>>(obj: T) => GetPath<T, P> {
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
