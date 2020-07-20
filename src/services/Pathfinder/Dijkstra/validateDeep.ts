import { Terrain } from '../../../entities'

/**
 * Validate a map to ensure all it's values are either a number or a map
 *
 * @param {Map} map - Map to valiadte
 */
export default function validateDeep<K, V>(map: Map<K, V>) {
  if (!(map instanceof Map)) {
    throw new Error(`Invalid graph: Expected Map instead found ${typeof map}`)
  }

  map.forEach((value, key) => {
    if (typeof value === 'object' && value instanceof Map) {
      validateDeep(value)
      return
    }

    if (!(value instanceof Terrain)) {
      throw new Error(
        `Values must be Terrain instances. Found value ${value} at ${key}`
      )
    }
  })
}
