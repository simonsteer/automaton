import { GraphNodeMap } from '../Deployment/Dijkstra/types'
import { Coords } from '..'
import { RawCoords } from '../Coords'

export function mergeGraphs(
  strategy: 'difference' | 'intersect' | 'union',
  ...graphs: GraphNodeMap[]
) {
  return GraphMergeStrategies[strategy](...graphs)
}

export function mergeCoordinates(
  strategy: 'difference' | 'intersect' | 'union',
  ...coords: RawCoords[][]
) {
  return CoordinatesMergeStrategies[strategy](...coords)
}

const GraphMergeStrategies = {
  difference(...nodeMaps: GraphNodeMap[]) {
    return nodeMaps.reduce((acc, nodeMap, index) => {
      const otherNodeMaps = nodeMaps.filter((_, i) => i !== index)

      for (const node in nodeMap) {
        const neighbour = nodeMap[node]
        const otherNeighbours = otherNodeMaps
          .map(other => other[node])
          .filter(Boolean)

        for (const neighbourKey in neighbour) {
          if (
            !otherNeighbours.some(
              otherNeighbour => neighbourKey in otherNeighbour
            )
          ) {
            acc[node] = {
              ...(acc[node] || {}),
              [neighbourKey]: neighbour[neighbourKey],
            }
          }
        }
      }

      return acc
    }, {} as GraphNodeMap)
  },
  intersect(...[first, ...rest]: GraphNodeMap[]) {
    if (!rest.length) {
      return first || {}
    }
    const firstKeys = Object.keys(first)

    return firstKeys.reduce((acc, node) => {
      const neighbour = first[node]
      if (rest.some(other => !(node in other))) {
        return acc
      } else {
        const otherNeighbour = rest[0][node]
        const otherKeys = Object.keys(otherNeighbour)
        firstKeys.forEach(key => {
          if (otherKeys.includes(key)) {
            acc[node] = {
              ...(acc[node] || {}),
              [key]: neighbour[key],
            }
          }
        })
      }

      return acc
    }, {} as GraphNodeMap)
  },
  union(...nodeMaps: GraphNodeMap[]) {
    return nodeMaps.reduce((acc, nodeMap) => {
      for (const node in nodeMap) {
        const neighbour = nodeMap[node]
        acc[node] = { ...(acc[node] || {}), ...neighbour }
      }
      return acc
    }, {} as GraphNodeMap)
  },
}

const CoordinatesMergeStrategies = {
  difference(...coordinatesSets: RawCoords[][]) {
    const difference = new Set<string>()
    const sets = coordinatesSets.map(
      collection => new Set(Coords.hashMany(collection))
    )
    sets.forEach((set, index) => {
      const otherSets = sets.filter((_, otherIndex) => index !== otherIndex)
      ;[...set]
        .filter(value => !otherSets.some(otherSet => otherSet.has(value)))
        .forEach(value => difference.add(value))
    })
    return Coords.parseMany([...difference])
  },
  intersect(...coordinatesSets: RawCoords[][]) {
    const [firstCollection, ...restCollections] = coordinatesSets.map(
      Coords.hashMany
    )
    if (!restCollections.length) {
      return Coords.parseMany(firstCollection) || []
    }

    const sets = restCollections.map(collection => new Set(collection))
    return [...firstCollection]
      .filter(item => sets.every(set => set.has(item)))
      .map(hash => Coords.parse(hash))
  },
  union(...coordinatesSets: RawCoords[][]) {
    const union = new Set<string>()
    coordinatesSets.forEach(collection =>
      Coords.hashMany(collection).forEach(item => union.add(item))
    )
    return [...union].map(hash => Coords.parse(hash))
  },
}
