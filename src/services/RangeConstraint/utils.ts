export function union<T>(...collections: T[][]) {
  const union = new Set<T>()
  collections.forEach(collection => collection.forEach(item => union.add(item)))
  return [...union]
}

export function intersect<T>(...collections: T[][]) {
  const [firstCollection, ...restCollections] = collections
  const sets = restCollections.map(collection => new Set(collection))
  return [
    ...new Set(
      [...firstCollection].filter(item => sets.every(set => set.has(item)))
    ),
  ]
}

export function difference<T>(...collections: T[][]) {
  const difference = new Set<T>()
  const sets = collections.map(collection => new Set(collection))
  sets.forEach((set, index) => {
    const otherSets = sets.filter((_, otherIndex) => index !== otherIndex)
    ;[...set]
      .filter(value => !otherSets.some(otherSet => otherSet.has(value)))
      .forEach(value => difference.add(value))
  })
  return [...difference]
}
