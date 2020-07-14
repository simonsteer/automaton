import { DeepMap, GraphNodeMap, GraphNodeNeighbour } from './types'
import { Terrain } from '../../entities'

/**
 * Validates a cost for a node
 *
 * @private
 * @param {number} val - Cost to validate
 * @return {bool}
 */
/**
 * Creates a deep `Map` from the passed object.
 *
 * @param  {Object} source - Object to populate the map with
 * @return {Map} New map with the passed object data
 */
export default function toDeepMap(source: GraphNodeMap | GraphNodeNeighbour) {
  const map = new Map() as DeepMap
  const keys = Object.keys(source)

  keys.forEach(key => {
    const val = source[key as keyof typeof source]

    if (val instanceof Terrain) {
      return map.set(key, val)
    }

    if (!(val instanceof Terrain)) {
      throw new Error(
        `Could not add node at key "${key}", make sure it's a valid node`
      )
    }

    return map.set(key, toDeepMap(val))
  })

  return map
}
