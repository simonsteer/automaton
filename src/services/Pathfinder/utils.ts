import { GraphNodeNeighbour, GraphNodeMap } from './Dijkstra/types'

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

export function union(...nodeMaps: GraphNodeMap[]) {
  return nodeMaps.reduce((acc, nodeMap) => {
    for (const node in nodeMap) {
      const neighbour = nodeMap[node]
      acc[node] = { ...(acc[node] || {}), ...neighbour }
    }
    return acc
  }, {} as GraphNodeMap)
}
