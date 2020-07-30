import compact from 'lodash/compact'
import ConflictManager from '../ConflictManager'

export default class TurnManager {
  battle: BattleManager
  team: Team

  private unitData = new Map<
    Symbol,
    { maxActions: number; actionsTaken: number }
  >()

  private actionableUnits!: ReturnType<TurnManager['mapActionsToPathfinder']>[]

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = battle.grid.get.teams()
    this.team = teams[battle.turn % teams.length]
    this.team.get.units().forEach(unit =>
      this.unitData.set(unit.id, {
        actionsTaken: 0,
        maxActions: unit.actions,
      })
    )
  }

  getActionableUnits = () => {
    if (!this.actionableUnits) {
      this.actionableUnits = [...this.unitData].reduce(
        (acc, [unitId, { actionsTaken, maxActions }]) => {
          if (actionsTaken > maxActions) {
            return acc
          }

          const pathfinder = this.battle.grid.get.pathfinder(unitId)
          if (!pathfinder || pathfinder.unit.currentHealth < 1) {
            return acc
          }

          acc.push(
            this.mapActionsToPathfinder(pathfinder, {
              maxActions,
              actionsTaken,
            })
          )
          return acc
        },
        [] as ReturnType<TurnManager['mapActionsToPathfinder']>[]
      )
    } else {
      this.actionableUnits = this.actionableUnits.filter(
        ({ actionsTaken, maxActions }) => actionsTaken < maxActions
      )
    }

    return this.actionableUnits
  }

  private mapActionsToPathfinder = (
    pathfinder: Pathfinder,
    { actionsTaken, maxActions }: { actionsTaken: number; maxActions: number }
  ) => {
    const { unit } = pathfinder
    return {
      pathfinder,
      unit,
      actionsTaken,
      maxActions,
      actions: {
        move: this.createAction(unit.id, (path: RawCoords[]) => {
          // pathfinder.move(path)
        }),
        engage: this.createAction(unit.id, (unitB: Unit) =>
          new ConflictManager(unit, unitB).process()
        ),
        custom: <M>(callback: () => M) => {
          return this.createAction(unit.id, callback)()
        },
      },
    }
  }

  private createAction = <Callback extends (...args: any) => any>(
    unitId: Symbol,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    const result = callback(...args) as ReturnType<Callback>
    this.incrementActionsTaken(unitId)
    return { actionableUnits: this.getActionableUnits(), sideEffect: result }
  }

  private incrementActionsTaken = (unitId: Symbol) => {
    const unitData = this.unitData.get(unitId)
    if (unitData) unitData.actionsTaken++
  }
}
