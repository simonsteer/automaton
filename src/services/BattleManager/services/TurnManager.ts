import ConflictManager from './ConflictManager'
import { Pathfinder, BattleManager } from '../..'
import { Unit, Team } from '../../../entities'

export type ActionableUnit = ReturnType<TurnManager['mapActionsToPathfinder']>

export default class TurnManager {
  battle: BattleManager
  team: Team
  actionableUnits: ActionableUnit[]

  private unitData = new Map<
    Pathfinder,
    { maxActions: number; actionsTaken: number }
  >()

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = battle.grid.getTeams()
    this.team = teams[battle.turnIndex % teams.length]
    this.team.getPathfinders(this.battle.grid).forEach(pathfinder =>
      this.unitData.set(pathfinder, {
        actionsTaken: 0,
        maxActions: pathfinder.unit.actions,
      })
    )
    this.actionableUnits = this.getActionableUnits()
  }

  restoreUnitActions(
    identifier: Symbol | Pathfinder | Unit,
    numActionsToRestore: number
  ) {
    let pathfinder: undefined | Pathfinder
    if (typeof identifier === 'symbol')
      pathfinder = this.battle.grid.getPathfinder(identifier)
    else if (identifier instanceof Unit)
      pathfinder = this.battle.grid.getPathfinder(identifier.id)
    else if (identifier instanceof Pathfinder) pathfinder = identifier

    if (pathfinder)
      Array(numActionsToRestore)
        .fill(0)
        .forEach(() => this.decrementActionsTaken(pathfinder!))

    this.bustActionableUnitsCache()
    return this
  }

  getActionableUnits = (): ActionableUnit[] => {
    if (!this.actionableUnits) {
      this.bustActionableUnitsCache()
    }
    return this.actionableUnits
  }

  private updateActionableUnits = () => {
    this.actionableUnits = this.actionableUnits.filter(
      ({ maxActions, actionsTaken }) => actionsTaken < maxActions
    )
    return this.actionableUnits
  }

  private bustActionableUnitsCache = () => {
    this.actionableUnits = [...this.unitData].reduce(
      (acc, [pathfinder, { actionsTaken, maxActions }]) => {
        if (actionsTaken < maxActions && !pathfinder.unit.isDead) {
          acc.push(this.mapActionsToPathfinder(this, pathfinder))
        }
        return acc
      },
      [] as ReturnType<TurnManager['mapActionsToPathfinder']>[]
    )
  }

  private mapActionsToPathfinder = (
    turn: TurnManager,
    pathfinder: Pathfinder
  ) => ({
    unit: pathfinder.unit,
    pathfinder,
    get actionsTaken() {
      return turn.unitData.get(pathfinder)!.actionsTaken
    },
    get maxActions() {
      return turn.unitData.get(pathfinder)!.maxActions
    },
    actions: {
      move: this.createAction(this, pathfinder, pathfinder.move),
      engage: this.createAction(this, pathfinder, (otherUnit: Unit) =>
        new ConflictManager(pathfinder.unit, otherUnit).process()
      ),
      wait: this.createAction(this, pathfinder, () => {
        const unitData = this.unitData.get(pathfinder)
        if (unitData) {
          unitData.actionsTaken = unitData.maxActions - 1
        }
      }),
      custom: <M>(callback: () => M) => {
        return this.createAction(this, pathfinder, callback)()
      },
    },
  })

  private createAction = <Callback extends (...args: any) => any>(
    ctx: TurnManager,
    pathfinder: Pathfinder,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    const sideEffect = callback(...args) as ReturnType<Callback>
    this.incrementActionsTaken(pathfinder)
    this.updateActionableUnits()

    return {
      endTurn: () =>
        this.battle.regenerator?.next(this.battle.regenerator).value,
      get actionableUnits() {
        return ctx.getActionableUnits()
      },
      sideEffect,
    }
  }

  private incrementActionsTaken = (pathfinder: Pathfinder) => {
    const unitData = this.unitData.get(pathfinder)
    if (unitData) unitData.actionsTaken++
  }

  private decrementActionsTaken = (pathfinder: Pathfinder) => {
    const unitData = this.unitData.get(pathfinder)
    if (unitData) unitData.actionsTaken--
  }
}
