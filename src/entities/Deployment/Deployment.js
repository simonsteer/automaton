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

  get current_footprint() {
    return this.unit.movement.footprint.adjacent(this.coordinates)
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
      [
        Coords.hash(from),
        Coords.hash(to),
        this.grid.id,
        this.grid.timestamp,
      ].join()
  )

  reachable_coords = memoize(
    (from = this.coordinates.raw) =>
      this.apply_movement_options(from).map(hash => Coords.parse(hash).raw),
    (from = this.coordinates.raw) =>
      [Coords.hash(from), this.grid.id, this.grid.timestamp].join()
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
        if (acc.abort || !this.unit || this.unit.is_dead) {
          return acc
        }
        if (!this.footprint_difference(coordinates)) {
          console.log({ no_footprint: coordinates })
          acc.abort = true
          return acc
        }

        const tile = this.grid.tile_at(coordinates)

        const tiles = this.unit.movement.footprint.adjacent(coordinates)

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
          } else if (
            !tile.deployment &&
            tile.should_guard_crossover(this, tile)
          ) {
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
          const footprint_difference = this.footprint_difference(coords)
          if (footprint_difference) {
            if (!acc) acc = {}
            acc[coords.hash] = footprint_difference.map(this.grid.tile_at)
          }
          return acc
        }, undefined)
      if (node_neighbour) graph[data.coords.hash] = node_neighbour
    })

    return new Graph(graph)
  }

  footprint_difference = memoize(
    coordinates => {
      if (!this.grid || !this.grid.within_bounds(coordinates)) return null

      const { footprint } = this.unit.movement
      const footprint_adjacent = footprint
        .adjacent(coordinates)
        .filter(this.grid.within_bounds)

      if (
        footprint_adjacent.length !== footprint.size ||
        footprint_adjacent.reduce(
          (acc, coord) => acc + this.grid.tile_at(coord).cost(this.unit),
          0
        ) > footprint.size
      ) {
        return null
      }

      return footprint_adjacent.filter(
        next_footprint_coord =>
          !this.current_footprint.some(potential_overlap =>
            next_footprint_coord.match(potential_overlap)
          )
      )
    },
    coordinates => [Coords.hash(coordinates), this.grid.id].join()
  )

  apply_movement_options = (
    from = this.coordinates,
    steps_left = this.unit.movement.steps * this.unit.movement.footprint.size,
    metadata = {
      pass_through_count: 0,
      accessible: new Set(),
      inaccessible: new Set(),
    }
  ) => [
      ...this.unit.movement.constraint
        .adjacent(from)
        .filter(c => this.grid.within_bounds(c) && !this.coordinates.match(c))
        .reduce((acc, coordinates) => {
          const {
            can_pass_through_other_unit,
            unit_pass_through_limit,
          } = this.unit.movement

          const footprint_difference = this.footprint_difference(coordinates)
          if (
            !footprint_difference ||
            steps_left <= 0 ||
            acc.inaccessible.has(Coords.hash(from))
          ) {
            return acc
          }

          const { movement_cost, deployments } = footprint_difference.reduce(
            (acc, coordinates) => {
              const tile = this.grid.tile_at(coordinates)

              acc.movement_cost += tile.cost(this.unit)
              if (tile.deployment) acc.deployments.push(tile.deployment)
              return acc
            },
            { movement_cost: 0, deployments: [] }
          )

          const next_steps_left = steps_left - movement_cost

          if (
            next_steps_left < 0 ||
            acc.pass_through_count + deployments.length > unit_pass_through_limit
          ) {
            return acc
          }

          const did_pass_through_units = deployments.reduce((acc, deployment) => {
            if (acc === false) return false
            const can_pass = can_pass_through_other_unit(deployment.unit)
            if (!can_pass) acc.inaccessible.add(coordinates.hash)
            return can_pass
          }, undefined)

          if (did_pass_through_units === true) {
            acc.pass_through_count += deployments.length
          }

          acc.accessible.add(coordinates.hash)
          if (
            next_steps_left > 0 &&
            (!did_pass_through_units ||
              acc.pass_through_count < unit_pass_through_limit)
          ) {
            this.apply_movement_options(coordinates, next_steps_left, acc)
          }

          return acc
        }, metadata).accessible,
    ]
}

export default container.register(Deployment)
