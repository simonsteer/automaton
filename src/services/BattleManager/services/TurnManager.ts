import ConflictManager from './ConflictManager'
import { Pathfinder, BattleManager } from '../..'
import { Unit, Team } from '../../../entities'

export type ActionableUnit = ReturnType<TurnManager['mapActionsToPathfinder']>

export default class TurnManager {
  battle: BattleManager
  team: Team

  private unitData = new Map<
    Pathfinder,
    { maxActions: number; actionsTaken: number }
  >()

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = this.battle.grid.getTeams()
    this.team = teams[battle.turnIndex % teams.length]

    this.battle.grid.on('addUnits', pathfinders => {
      const didTeamUnitsChange = pathfinders.reduce((acc, pathfinder) => {
        if (pathfinder.unit.team.id === this.team.id) {
          acc = true
          this.initUnitData(pathfinder)
        }
        return acc
      }, false)

      if (didTeamUnitsChange)
        this.battle.emit('actionableUnitsChanged', this.getActionableUnits())
    })

    this.team.getPathfinders(this.battle.grid).forEach(this.initUnitData)
  }

  getActionableUnits = (): ActionableUnit[] =>
    [...this.unitData].reduce(
      (acc, [pathfinder, { actionsTaken, maxActions }]) => {
        if (actionsTaken < maxActions && !pathfinder.unit.isDead) {
          acc.push(this.mapActionsToPathfinder(this, pathfinder))
        }
        return acc
      },
      [] as ReturnType<TurnManager['mapActionsToPathfinder']>[]
    )

  mapActionsToPathfinder = (turn: TurnManager, pathfinder: Pathfinder) => ({
    unit: pathfinder.unit,
    pathfinder,
    get actionsTaken() {
      return turn.unitData.get(pathfinder)!.actionsTaken
    },
    get maxActions() {
      return turn.unitData.get(pathfinder)!.maxActions
    },
    actions: {
      move: this.createAction(pathfinder, pathfinder.move),
      engage: this.createAction(pathfinder, (otherUnit: Unit) =>
        new ConflictManager(pathfinder.unit, otherUnit).process()
      ),
      wait: this.createAction(pathfinder, () => {
        const unitData = this.unitData.get(pathfinder)
        if (unitData) {
          unitData.actionsTaken = unitData.maxActions - 1
        }
      }),
      custom: <M>(callback: () => M) => {
        return this.createAction(pathfinder, callback)()
      },
    },
  })

  createAction = <Callback extends (...args: any) => any>(
    pathfinder: Pathfinder,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    this.incrementActionsTaken(pathfinder)
    const result = callback(...args) as ReturnType<Callback>
    this.battle.emit(
      'actionableUnitChanged',
      this.mapActionsToPathfinder(this, pathfinder)
    )
    return result
  }

  private incrementActionsTaken = (pathfinder: Pathfinder) => {
    const unitData = this.unitData.get(pathfinder)
    if (unitData) unitData.actionsTaken++
  }

  private initUnitData = (pathfinder: Pathfinder) =>
    this.unitData.set(pathfinder, {
      actionsTaken: 0,
      maxActions: pathfinder.unit.actions,
    })
}
