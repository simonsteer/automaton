import { GridGraph, GridVectorData, GridEvents, GridQuery } from './types'
import { mapGraph } from '../../utils'
import Deployment from '../../services/Deployment'
import Coords, { RawCoords } from '../../services/Coords'
import { Unit, Tile, Team } from '..'
import { TypedEventEmitter } from '../../services'

export default class Grid {
  readonly id = Symbol()

  timestamp = Date.now()
  graph: GridGraph
  deployments = new Map<Symbol, Deployment>()
  coordinates = new Map<string, Symbol>()
  events = new TypedEventEmitter<GridEvents>()

  constructor({
    graph,
    units,
  }: {
    graph: Tile[][]
    units?: [Unit, RawCoords][]
  }) {
    this.graph = mapGraph(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
    if (units) this.deployUnits(units)
  }

  get size() {
    return { y: this.graph.length, x: this.graph[0].length }
  }

  withinBounds = ({ x, y }: RawCoords) =>
    x >= 0 && x < this.size.x && y >= 0 && y < this.size.y

  getCoordinateData = (coordinates: RawCoords) => {
    if (!this.withinBounds(coordinates)) return null

    const tile = this.getTile(coordinates)!
    const unitId = this.coordinates.get(Coords.hash(coordinates))
    const deployment = unitId && this.deployments.get(unitId)

    return { deployment, tile }
  }

  getTile = ({ x, y }: RawCoords): Tile | undefined => this.graph[y]?.[x]?.tile

  getDeployment = (query: GridQuery) => {
    const unitId =
      typeof query === 'symbol'
        ? query
        : this.coordinates.get(Coords.hash(query as RawCoords))

    return unitId && this.deployments.get(unitId)
  }

  getDeployments = (queries = [...this.deployments.keys()] as GridQuery[]) =>
    queries.map(this.getDeployment).filter(Boolean) as Deployment[]

  getTeams = () => [
    ...this.getDeployments().reduce((acc, deployment) => {
      if (!acc.has(deployment.unit.team)) {
        acc.add(deployment.unit.team)
      }
      return acc
    }, new Set<Team>()),
  ]

  deployUnit = (unit: Unit, coordinates: RawCoords) => {
    const deployment = this.createDeployment(unit, coordinates)
    if (deployment) this.events.emit('unitsDeployed', [deployment])
  }

  deployUnits = (unitData: [Unit, RawCoords][]) => {
    const deployments = unitData
      .map(([unit, coordinates]) => this.createDeployment(unit, coordinates))
      .filter(Boolean) as Deployment[]

    if (deployments.length) this.events.emit('unitsDeployed', deployments)
  }

  withdrawUnit = (query: GridQuery) => {
    const withdrawnDeployment = this.attemptWithdrawal(query)
    if (withdrawnDeployment) {
      this.events.emit('unitsWithdrawn', [withdrawnDeployment.unit.id])
    }
  }

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

  clear = () => this.withdrawUnits([...this.deployments.keys()])

  mapTiles<R>(callback: (item: GridVectorData, coordinates: RawCoords) => R) {
    return mapGraph(this.graph, callback)
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
