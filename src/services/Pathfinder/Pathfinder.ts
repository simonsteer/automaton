import Coords from '../Coords'
import Graph from './Dijkstra/Graph'
import { GraphNodeNeighbour } from './Dijkstra/types'

export default class Pathfinder {
  readonly grid: Grid
  readonly unit: Unit
  readonly graph: Graph
  private _coordinates: Coords

  constructor({
    grid,
    unit,
    coordinates,
  }: {
    grid: Grid
    unit: Unit
    coordinates: RawCoords
  }) {
    this.grid = grid
    this.unit = unit
    this._coordinates = new Coords(coordinates)
    this.graph = this.buildGraph()
  }

  get coordinates() {
    return this._coordinates
  }

  move = (path: RawCoords[]) => {
    if (path.length < 1) {
      console.error(
        `Paths must contain at least one set of coordinates. Pathfinder#move receieved a path with a length of 0.`
      )
      return []
    }

    return path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort || this.unit.isDead) {
          return acc
        }

        const data = this.grid.get.data(coordinates)
        if (!data) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const { pathfinder, tile } = data
        const isLastStep = index === path.length - 1

        if (tile.guard.entry(this.unit)) {
          acc.abort = true
          tile.on.guard.entry(this.unit)
          tile.on.unit.stop(this.unit)
        } else {
          const prev = path[index - 1] as RawCoords | undefined
          if (prev) this.grid.get.data(prev)?.tile.on.unit.exit(this.unit)

          acc.path.push(coordinates)
          tile.on.unit.enter(this.unit)

          if (isLastStep) {
            tile.on.unit.stop(this.unit)
          } else if (!pathfinder && tile.guard.crossover(this.unit)) {
            acc.abort = true
            tile.on.guard.crossover(this.unit)
            tile.on.unit.stop(this.unit)
          }
        }

        return acc
      },
      { path: [] as RawCoords[], abort: false }
    ).path
  }

  get = {
    route: (toCoords: RawCoords) => {
      const result = this.graph.path(
        this.unit,
        this.coordinates.hash,
        Coords.hash(toCoords),
        { cost: true }
      ) as { path: null | string[]; cost: number }

      return result.path?.map(Coords.parse).slice(1) || []
    },
    reachable: (
      fromCoords = this.coordinates,
      stepsLeft = this.unit.movement.steps,
      accumulator = new Set<string>()
    ) =>
      [
        ...this.unit.movement.pattern
          .adjacent(fromCoords)
          .filter(this.grid.withinBounds)
          .reduce((acc, coordinates) => {
            if (this.coordinates.hash === coordinates.hash) return acc

            const tileCost = this.grid.get
              .data(coordinates)!
              .tile.terrain.cost(this.unit)

            if (tileCost > stepsLeft) return acc
            if (!acc.has(coordinates.hash)) acc.add(coordinates.hash)
            if (stepsLeft - tileCost > 0)
              this.get.reachable(coordinates, stepsLeft - tileCost, acc)

            return acc
          }, accumulator),
      ].map(Coords.parse),
    targetable: (fromCoords = this.coordinates) =>
      this.unit.weapon?.range.adjacent(fromCoords).filter(coords => {
        if (!this.grid.withinBounds(coords)) {
          return false
        }
        const otherTeam = this.grid.get.data(coords)?.pathfinder?.unit?.team
        return !!(
          otherTeam?.is.hostile(this.unit.team) ||
          otherTeam?.is.wildcard(this.unit.team)
        )
      }) || [],
  }

  private buildGraph() {
    const graph = new Graph()
    this.grid.mapTiles(tile => {
      const neighbours: GraphNodeNeighbour = {}
      this.unit.movement.pattern
        .adjacent(tile.coords)
        .filter(coords => coords.withinBounds(this.grid))
        .forEach(({ x, y }) => {
          const neighbour = this.grid.graph[y]?.[x]
          if (neighbour) {
            neighbours[neighbour.coords.hash] = neighbour.tile.terrain
          }
        })
      graph.addNode(tile.coords.hash, neighbours)
    })
    return graph
  }
}
