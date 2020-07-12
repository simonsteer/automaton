import Coords from '../Coords'

export default class GridManager {
  grid: Grid
  units: GridManagedUnit[] = []
  constructor(grid: Grid, units: [Unit, RawCoords][]) {
    this.grid = grid
    this.addUnits(...units)
  }

  addUnits(...units: [Unit, RawCoords][]) {
    units.forEach(([unit, { x, y }]) =>
      this.units.push({
        unit,
        coordinates: new Coords({ x, y }),
      })
    )
  }
}
