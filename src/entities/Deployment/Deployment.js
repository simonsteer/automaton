import Graph from '../../services/Dijkstra/Graph'
import Coords from '../../services/Coords'
import { memoize } from '../../utils'
import container, { Entity } from '../container'
import Unit from '../Unit'
import Grid from '../Grid'
import Tile from '../Tile'

class Deployment extends Entity {
  coordinates
  actions_taken = 0

  constructor({ grid, unit, coordinates }) {
    super({ unit: Unit, grid: Grid, tile: Tile }, () => {
      this.link_unit(unit)
      unit.link_deployment(this)
      this.link_grid(grid)
      grid.link_deployments(this)
      this.set_coordinates(coordinates)
      this.graph = this.create_graph()
    })
  }

  set_coordinates = coordinates => {
    if (!this.coordinates) {
      this.coordinates = new Coords(coordinates)
    } else {
      this.coordinates.update(coordinates)
    }
    this.tile?.unlink_deployment()
    const next_tile = this.grid.tile_at(this.coordinates)
    next_tile.link_deployment(this)
    this.link_tile(next_tile)

    this.grid.timestamp++
  }

  get_route = memoize(
    ({ from = this.coordinates.raw, to }) =>
      this.graph
        .path(this.unit, Coords.hash(from), Coords.hash(to), { cost: true })
        .path?.map(hash => Coords.parse(hash).raw)
        .slice(1) || [],
    ({ from = this.coordinates.raw, to }) =>
      [Coords.hash(from), Coords.hash(to), this.grid.timestamp].join()
  )

  reachable_coords = memoize(
    (from = this.coordinates.raw) =>
      this.apply_movement_options(from).map(hash => Coords.parse(hash).raw),
    (from = this.coordinates.raw) =>
      [Coords.hash(from), this.grid.timestamp].join()
  )

  move = path => {
    if (path.length < 1) {
      console.error(
        `Paths must contain at least one set of coordinates. Deployment#move receieved a path with a length of 0.`
      )
      return []
    }

    const result = path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort || this.unit.is_dead) {
          return acc
        }
        if (this.grid.out_of_bounds(coordinates)) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const tile = this.grid.tile_at(coordinates)

        if (tile.should_guard_entry(this, tile)) {
          acc.abort = true
          this.grid.events.emit('guardTileEntry', this, tile)
          this.grid.events.emit('unitStopTile', this, tile)
        } else {
          const prev = path[index - 1]
          if (prev) this.grid.events.emit('unitExitTile', this, tile)

          acc.path.push(coordinates)
          this.set_coordinates(coordinates)
          this.grid.events.emit('unitEnterTile', this, tile)

          const is_last_step = index === path.length - 1
          if (is_last_step) {
            this.grid.events.emit('unitStopTile', this, tile)
          } else if (!tile.deployment && tile.should_guard_crossover(this, tile)) {
            acc.abort = true
            this.grid.events.emit('guardTileCrossover', this, tile)
            this.grid.events.emit('unitStopTile', this, tile)
          }
        }

        return acc
      },
      { path: [], abort: false }
    ).path

    if (result.length) {
      this.grid.events.emit('unitMovement', this, result)
    }
    this.actions_taken++

    return result
  }

  engage = deployment => {
    this.grid.events.emit('deploymentsEngaged', this, deployment)
    this.actions_taken++
  }

  create_graph() {
    const graph = {}

    this.grid.map_tiles(data => {
      const node_neighbour = this.unit.movement.constraint
        .adjacent(data.coords)
        .reduce((acc, coords) => {
          if (coords.within_bounds(this.grid)) {
            if (!acc) acc = {}
            const neighbour = this.grid.tiles[coords.y][coords.x]
            acc[coords.hash] = neighbour.tile
          }
          return acc
        }, undefined)
      if (node_neighbour) graph[data.coords.hash] = node_neighbour
    })

    return new Graph(graph)
  }

  apply_movement_options = (
    from = this.coordinates.raw,
    steps_left = this.unit.movement.steps,
    accumulator = {
      pass_through_count: 0,
      accessible: new Set(),
      inaccessible: new Set(),
    }
  ) => [
      ...this.unit.movement.constraint
        .adjacent(from)
        .filter(this.grid.within_bounds)
        .reduce((acc, coordinates) => {
          console.log(coordinates)
          const {
            can_pass_through_other_unit,
            unit_pass_through_limit,
          } = this.unit.movement

          if (steps_left <= 0 || acc.inaccessible.has(Coords.hash(from))) {
            return acc
          }

          const tile = this.grid.tile_at(coordinates)
          const deployment = tile.deployment
          const movement_cost = tile.cost(this.unit)

          if (movement_cost > steps_left) {
            return acc
          }

          let did_pass_through_unit = false
          if (deployment?.unit && deployment.unit.id !== this.unit.id) {
            if (!can_pass_through_other_unit(deployment.unit)) {
              acc.inaccessible.add(coordinates.hash)
              return acc
            }
            did_pass_through_unit = true
            acc.pass_through_count++
          }

          acc.accessible.add(coordinates.hash)
          if (
            steps_left - movement_cost > 0 &&
            (!did_pass_through_unit ||
              acc.pass_through_count < unit_pass_through_limit)
          ) {
            this.apply_movement_options(
              coordinates,
              steps_left - movement_cost,
              acc
            )
          }

          return acc
        }, accumulator).accessible,
    ]
}

export default container.register(Deployment)