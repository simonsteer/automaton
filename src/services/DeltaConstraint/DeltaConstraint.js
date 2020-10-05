import Coords from '../../services/Coords'
import { memoize } from "../../utils"

export default class DeltaConstraint {
  delta_map = {}
  deltas = []

  constructor(deltas) {
    this.deltas = deltas
    deltas.forEach(({ x, y }) => {
      if (!this.delta_map[x]) this.delta_map[x] = {}
      this.delta_map[x][y] = true
    })
  }

  adjacent = memoize(
    (coords) =>
      this.deltas.map(
        d => new Coords({ x: coords.x + d.x, y: coords.y + d.y })
      ),
    Coords.hash
  )

  applies = (coords_a, coords_b) => {
    const { x, y } = Coords.deltas(coords_a, coords_b)
    return !!this.delta_map[x]?.[y]
  }
}
