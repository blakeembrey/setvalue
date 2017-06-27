const _hasOwnProperty = Object.prototype.hasOwnProperty

export type Path = Array<string | number | symbol>

export function set <T = any> (obj: any, path: Path, value: T): void | T {
  if (path.length === 0) {
    return undefined
  }

  let res = obj
  const last = path[path.length - 1]

  if (path.length === 1) {
    if (isObject(res)) {
      return res[last] = value
    }

    return undefined
  }

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]

    if (!_hasOwnProperty.call(res, key) || !isObject(res[key])) {
      res[key] = {}
    }

    res = res[key]
  }

  return res[last] = value
}

function isObject (value: any) {
  return value != null && (typeof value === 'object' || typeof value === 'function')
}
