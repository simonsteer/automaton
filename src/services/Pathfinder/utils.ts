import { GraphNodeMap } from './Dijkstra/types'

export function difference(...nodeMaps: GraphNodeMap[]) {
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

export function intersect(...[first, ...rest]: GraphNodeMap[]) {
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

export function union(...nodeMaps: GraphNodeMap[]) {
  return nodeMaps.reduce((acc, nodeMap) => {
    for (const node in nodeMap) {
      const neighbour = nodeMap[node]
      acc[node] = { ...(acc[node] || {}), ...neighbour }
    }
    return acc
  }, {} as GraphNodeMap)
}
