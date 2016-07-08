import test = require('blue-tape')
import { set } from './index'

test('setvalue', t => {
  t.equal(set(null, ['prop'], true), undefined)
  t.equal(set(undefined, ['prop'], true), undefined)

  // Set property.
  const obj1 = { a: {} }
  set(obj1, ['a', 'b', 'c'], 10)
  t.deepEqual(obj1, { a: { b: { c: 10 } } })

  // Override property.
  const obj2 = { a: true }
  set(obj2, ['a', 'b', 'c'], 10)
  t.deepEqual(obj2, { a: { b: { c: 10 } } })

  // Skip loop.
  const obj3 = { a: true }
  set(obj3, ['b'], false)
  t.deepEqual(obj3, { a: true, b: false })

  // Noop.
  const obj4 = { a: true }
  set(obj4, [], false)
  t.deepEqual(obj4, { a: true })

  t.end()
})
