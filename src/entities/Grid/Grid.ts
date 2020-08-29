import { GridGraph, GridVectorData, GridEvents, GridQuery } from './types'
import { mapTiles } from '../../utils'
import Deployment from '../../services/Deployment'
import Coords, { RawCoords } from '../../services/Coords'
import { Unit, Tile, Team } from '..'
import { TypedEventEmitter } from '../../services'

export default class Grid {
  readonly id = Symbol()

  timestamp = Date.now()
  events = new TypedEventEmitter<GridEvents>()

  graph: GridGraph
  private deployments = new Map<Symbol, Deployment>()
  private coordinates = new Map<string, Symbol>()

  constructor({
    graph,
    units,
  }: {
    graph: Tile[][]
    units?: [Unit, RawCoords][]
  }) {
    this.graph = mapTiles(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
    if (units) this.deployUnits(units)
  }

  /**
   * @property
   * Class getter which returns the size of the x and y dimensions of the `Grid`
   * */
  get size() {
    return { y: this.graph.length, x: this.graph[0].length }
  }

  /**
   * @function
   * Determines whether a given set of `RawCoords` is within bounds of the `Grid`.
   *  */
  withinBounds = ({ x, y }: RawCoords) =>
    x >= 0 && x < this.size.x && y >= 0 && y < this.size.y

  /**
   * @function
   * Retrieve data relevant to a given set of `RawCoords`.
   *  */
  getCoordinateData = (coordinates: RawCoords) => {
    if (!this.withinBounds(coordinates)) return null

    const tile = this.graph[coordinates.y]?.[coordinates.x]?.tile
    const unitId = this.coordinates.get(Coords.hash(coordinates))
    const deployment = unitId && this.deployments.get(unitId)

    return { deployment, tile }
  }

  /**
   * @function
   * Returns a `Deployment` given the query passed in, or `undefined` if no `Deployment` can be found.
   *
   * @arguments
   * `GridQuery` – either a set of `RawCoords` or a `Unit.id`
   *  */
  getDeployment = (query: GridQuery) => {
    const unitId =
      typeof query === 'symbol'
        ? query
        : this.coordinates.get(Coords.hash(query as RawCoords))

    return unitId && this.deployments.get(unitId)
  }

  /**
   * @function
   * Returns an array of `Deployment`s given the queries passed in. An empty array is returned if no `Deployment`s are found.
   *
   * @arguments
   * `GridQuery[]` – an array of `RawCoord`s and/or `Unit.id`s
   *  */
  getDeployments = (queries = [...this.deployments.keys()] as GridQuery[]) =>
    queries.map(this.getDeployment).filter(Boolean) as Deployment[]

  /**
   * @function
   * Returns an array of `Team`s with active `Deployment`s on the `Grid`.
   * */
  getTeams = () => [
    ...this.getDeployments().reduce((acc, deployment) => {
      if (!acc.has(deployment.unit.team)) {
        acc.add(deployment.unit.team)
      }
      return acc
    }, new Set<Team>()),
  ]

  /**
   * @function
   * Attempt to create a `Deployment` on the grid. If a `Deployment` who's `Unit.id` already
   * exists on the `Grid`, or if a `Unit` already exists at the given set of `RawCoords`,
   * no `Deployment` will be created. Emits `GridEvents.unitsDeployed` if a `Deployment` is
   * successfully created.
   * */
  deployUnit = (unit: Unit, coordinates: RawCoords) => {
    const deployment = this.createDeployment(unit, coordinates)
    if (deployment) this.events.emit('unitsDeployed', [deployment])
  }

  /**
   * @function
   * Attempt to create multiple `Deployment`s on the grid. If a `Deployment` who's `Unit.id` already
   * exists on the `Grid`, or if a `Unit` already exists at the given set of `RawCoords`,
   * no `Deployment` will be created. Emits `GridEvents.unitsDeployed` if at least one `Deployment` is
   * successfully created.
   * */
  deployUnits = (unitData: [Unit, RawCoords][]) => {
    const deployments = unitData
      .map(([unit, coordinates]) => this.createDeployment(unit, coordinates))
      .filter(Boolean) as Deployment[]

    if (deployments.length) this.events.emit('unitsDeployed', deployments)
  }

  /**
   * @function
   * Attempt to remove a `Deployment` from the `Grid`. If there is no `Deployment` to be found via the given
   * `GridQuery`, no `Deployment` is withdrawn. If a deployment is successfully removed,
   * emits `GridEvents.unitsWithdrawn`.
   * */
  withdrawUnit = (query: GridQuery) => {
    const withdrawnDeployment = this.attemptWithdrawal(query)
    if (withdrawnDeployment) {
      this.events.emit('unitsWithdrawn', [withdrawnDeployment.unit.id])
    }
  }

  /**
   * @function
   * Attempt to remove multiple `Deployment`s from the `Grid`. If there is no `Deployment` to be found via the given
   * `GridQuery`s, no `Deployment` is withdrawn. If at least one deployment is successfully removed,
   * emits `GridEvents.unitsWithdrawn`.
   * */
  withdrawUnits = (queries: GridQuery[]) => {
    const withdrawals = queries
      .map(this.attemptWithdrawal)
      .filter(Boolean) as Deployment[]

    if (withdrawals.length) {
      this.events.emit(
        'unitsWithdrawn',
        withdrawals.map(withdrawn => withdrawn.unit.id)
      )
    }
  }

  /**
   * @function
   * Withdraw all `Deployments` from the `Grid`. Emits `GridEvents.unitsWithdrawn` if at least one `Deployment` is withdrawn.
   * */
  clear = () => this.withdrawUnits([...this.deployments.keys()])

  /**
   * @function
   * Map over each column of each row of the `Grid`, optionally returning a value.
   * */

  mapTiles<R>(callback: (item: GridVectorData, coordinates: RawCoords) => R) {
    return mapTiles(this.graph, callback)
  }

  private createDeployment = (unit: Unit, coordinates: RawCoords) => {
    if (this.deployments.get(unit.id)) {
      return undefined
    }

    const deployment = new Deployment({
      grid: this,
      unit,
      coordinates,
    })

    this.deployments.set(unit.id, deployment)
    this.coordinates.set(Coords.hash(coordinates), unit.id)
    this.timestamp++

    return deployment
  }

  private attemptWithdrawal = (query: GridQuery) => {
    const deployment = this.getDeployment(query)

    if (deployment) {
      this.coordinates.delete(deployment.coordinates.hash)
      this.deployments.delete(deployment.unit.id)
      this.timestamp++
    }

    return deployment
  }
}
