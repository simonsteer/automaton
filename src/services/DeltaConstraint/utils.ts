import Coords from '../Coords'

export function merge_deltas(
  strategy: 'difference' | 'intersect' | 'union',
  ...coords: { x: number; y: number }[][]
) {
  return CoordinatesMergeStrategies[strategy](...coords)
}

const CoordinatesMergeStrategies = {
  difference(...delta_sets: { x: number; y: number }[][]) {
    const difference = new Set<string>()
    const sets = delta_sets.map(
      collection => new Set(Coords.hash_many(collection))
    )
    sets.forEach((set, index) => {
      const other_sets = sets.filter((_, other_index) => index !== other_index)
      ;[...set]
        .filter(value => !other_sets.some(other_set => other_set.has(value)))
        .forEach(value => difference.add(value))
    })
    return Coords.parse_many([...difference])
  },
  intersect(...delta_sets: { x: number; y: number }[][]) {
    const [first_collection, ...rest_collections] = delta_sets.map(
      Coords.hash_many
    )
    if (!rest_collections.length) {
      return Coords.parse_many(first_collection) || []
    }

    const sets = rest_collections.map(collection => new Set(collection))
    return [...first_collection]
      .filter(item => sets.every(set => set.has(item)))
      .map(hash => Coords.parse(hash))
  },
  union(...delta_sets: { x: number; y: number }[][]) {
    const union = new Set<string>()
    delta_sets.forEach(collection =>
      Coords.hash_many(collection).forEach(item => union.add(item))
    )
    return [...union].map(hash => Coords.parse(hash))
  },
}
