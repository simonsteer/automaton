import { DeepMap } from './types'

/**
 * Validates a cost for a node
 *
 * @private
 * @param {number} val - Cost to validate
 * @return {bool}
 */
function isValidNode(val: any) {
  const cost = Number(val)

  if (isNaN(cost) || cost <= 0) {
    return false
  }

  return true
}

/**
 * Creates a deep `Map` from the passed object.
 *
 * @param  {Object} source - Object to populate the map with
 * @return {Map} New map with the passed object data
 */
export default function toDeepMap<D extends {}>(source: D) {
  const map = new Map() as DeepMap
  const keys = Object.keys(source)

  keys.forEach(key => {
    const val = source[key as keyof D]

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      return map.set(key, toDeepMap(val))
    }

    if (!isValidNode(val)) {
      throw new Error(
        `Could not add node at key "${key}", make sure it's a valid node`
      )
    }

    return map.set(key, Number(val))
  })

  return map
}
