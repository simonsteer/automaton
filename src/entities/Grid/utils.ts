export function mapGraph<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}
