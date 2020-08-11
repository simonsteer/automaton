import { GraphNodeMap } from '../Pathfinder/Dijkstra/types'
import { Coords } from '..'

function differenceGraphs(...nodeMaps: GraphNodeMap[]) {
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
}

function intersectGraphs(...[first, ...rest]: GraphNodeMap[]) {
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
}

function unionGraphs(...nodeMaps: GraphNodeMap[]) {
  return nodeMaps.reduce((acc, nodeMap) => {
    for (const node in nodeMap) {
      const neighbour = nodeMap[node]
      acc[node] = { ...(acc[node] || {}), ...neighbour }
    }
    return acc
  }, {} as GraphNodeMap)
}

function unionCoordinatesHashes(...coordinatesSets: string[][]) {
  const union = new Set<string>()
  coordinatesSets.forEach(collection =>
    collection.forEach(item => union.add(item))
  )
  return [...union].map(hash => Coords.parse(hash))
}

function intersectCoordinatesHashes(...coordinatesSets: string[][]) {
  const [firstCollection, ...restCollections] = coordinatesSets
  if (!restCollections.length) {
    return Coords.parseMany(firstCollection) || []
  }

  const sets = restCollections.map(collection => new Set(collection))
  return [...firstCollection]
    .filter(item => sets.every(set => set.has(item)))
    .map(hash => Coords.parse(hash))
}

function differenceCoordinatesHashes(...coordinatesSets: string[][]) {
  const difference = new Set<string>()
  const sets = coordinatesSets.map(collection => new Set(collection))
  sets.forEach((set, index) => {
    const otherSets = sets.filter((_, otherIndex) => index !== otherIndex)
    ;[...set]
      .filter(value => !otherSets.some(otherSet => otherSet.has(value)))
      .forEach(value => difference.add(value))
  })
  return Coords.parseMany([...difference])
}

export const graphMergeStrategies = {
  difference: differenceGraphs,
  intersect: intersectGraphs,
  union: unionGraphs,
}

export const coordinatesHashesMergeStrategies = {
  difference: differenceCoordinatesHashes,
  intersect: intersectCoordinatesHashes,
  union: unionCoordinatesHashes,
}
