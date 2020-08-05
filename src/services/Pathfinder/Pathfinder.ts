import Coords from '../Coords'
import Graph from './Dijkstra/Graph'
import { GraphNodeNeighbour } from './Dijkstra/types'
import * as mergeStrategies from '@automaton/services/RangeConstraint/utils'

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

        const data = this.grid.getData(coordinates)
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
          if (prev) this.grid.getData(prev)?.tile.on.unit.exit(this.unit)

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

  getRoute = (toCoords: RawCoords) => {
    const result = this.graph.path(
      this.unit,
      this.coordinates.hash,
      Coords.hash(toCoords),
      { cost: true }
    ) as { path: null | string[]; cost: number }

    return result.path?.map(Coords.parse).slice(1) || []
  }

  getReachable = (fromCoords = this.coordinates) =>
    this.merge(
      ...this.unit.movement.constraints.map(constraint =>
        this.getReachableForConstraint(constraint, fromCoords)
      )
    ).map(hash => Coords.parse(hash))

  getTargetable = (fromCoords = this.coordinates) =>
    this.unit.weapon?.range.adjacent(fromCoords).filter(coords => {
      if (!this.grid.withinBounds(coords)) {
        return false
      }
      const otherTeam = this.grid.getData(coords)?.pathfinder?.unit?.team
      return !!(
        otherTeam?.isHostile(this.unit.team) ||
        otherTeam?.isWildcard(this.unit.team)
      )
    }) || []

  private buildGraph() {
    const graph = new Graph()

    const constraintNeighbours = this.unit.movement.constraints.map(
      constraint => {
        const neighbours: string[] = []
        this.grid.mapTiles(tile => {
          neighbours.push(
            ...constraint
              .adjacent(tile.coords)
              .filter(coords => coords.withinBounds(this.grid))
              .map(({ x, y }) => {
                const neighbour = this.grid.graph[y][x]
                return `${tile.coords.hash}|${neighbour.coords.hash}`
              })
          )
        })
        return neighbours
      }
    )

    const neighbourMap: { [key: string]: GraphNodeNeighbour } = {}
    const merged = this.merge(...constraintNeighbours)
    merged
      .map(hash => {
        const [tileHash, neighbourHash] = hash.split('|')
        const t = Coords.parse(tileHash)
        const n = Coords.parse(neighbourHash)

        return {
          tile: this.grid.graph[t.y][t.x],
          neighbour: this.grid.graph[n.y][n.x],
        }
      })
      .forEach(({ tile, neighbour }) => {
        if (!neighbourMap[tile.coords.hash]) {
          neighbourMap[tile.coords.hash] = {}
        }
        neighbourMap[tile.coords.hash][neighbour.coords.hash] =
          neighbour.tile.terrain
      })

    Object.keys(neighbourMap).forEach(hash => {
      graph.addNode(hash, neighbourMap[hash])
    })

    return graph
  }

  private getReachableForConstraint = (
    constraint: RangeConstraint,
    fromCoords = this.coordinates,
    stepsLeft = this.unit.movement.steps,
    accumulator = {
      accessible: new Set<string>(),
      inaccessible: new Set<string>(),
    }
  ) => [
    ...constraint
      .adjacent(fromCoords)
      .filter(this.grid.withinBounds)
      .reduce((acc, coordinates) => {
        if (
          stepsLeft === 0 ||
          acc.inaccessible.has(fromCoords.hash) ||
          this.coordinates.hash === coordinates.hash
        ) {
          return acc
        }

        const tileData = this.grid.getData(coordinates)!
        const movementCost = tileData.tile.terrain.cost(this.unit)
        const tileUnit = tileData.pathfinder?.unit

        if (movementCost > stepsLeft) return acc
        if (tileUnit && !this.unit.movement.canPassThroughUnit(tileUnit)) {
          acc.inaccessible.add(coordinates.hash)
          return acc
        }

        acc.accessible.add(coordinates.hash)
        if (stepsLeft - movementCost > 0) {
          this.getReachableForConstraint(
            constraint,
            coordinates,
            stepsLeft - movementCost,
            acc
          )
        }

        return acc
      }, accumulator).accessible,
  ]

  private get merge() {
    return mergeStrategies[this.unit.movement.mergeStrategy]
  }
}
