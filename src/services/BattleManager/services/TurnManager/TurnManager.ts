import ConflictManager from '../ConflictManager'

export default class TurnManager {
  battle: BattleManager
  team: Team

  private unitData = new Map<
    Pathfinder,
    { maxActions: number; actionsTaken: number }
  >()

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = battle.grid.get.teams()
    this.team = teams[battle.turn % teams.length]
    this.team.get.pathfinders(this.battle.grid).forEach(pathfinder =>
      this.unitData.set(pathfinder, {
        actionsTaken: 0,
        maxActions: pathfinder.unit.actions,
      })
    )
  }

  getActionableUnits = () =>
    [...this.unitData].reduce(
      (acc, [pathfinder, { actionsTaken, maxActions }]) => {
        if (actionsTaken >= maxActions) {
          return acc
        }

        if (pathfinder.unit.isDead) {
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

  private mapActionsToPathfinder = (
    pathfinder: Pathfinder,
    { actionsTaken, maxActions }: { actionsTaken: number; maxActions: number }
  ) => {
    const { unit } = pathfinder
    return {
      pathfinder,
      actionsTaken,
      maxActions,
      actions: {
        move: this.createAction(pathfinder, pathfinder.move),
        engage: this.createAction(pathfinder, (unitB: Unit) =>
          new ConflictManager(unit, unitB).process()
        ),
        custom: <M>(callback: () => M) => {
          return this.createAction(pathfinder, callback)()
        },
      },
    }
  }

  private createAction = <Callback extends (...args: any) => any>(
    pathfinder: Pathfinder,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    const sideEffect = callback(...args) as ReturnType<Callback>
    this.incrementActionsTaken(pathfinder)

    const nextActionableUnits = this.getActionableUnits()
    if (nextActionableUnits.length === 0) {
      // next turn or end battle
    }

    return {
      nextActionableUnits,
      sideEffect,
    }
  }

  private incrementActionsTaken = (pathfinder: Pathfinder) => {
    const unitData = this.unitData.get(pathfinder)
    if (unitData) unitData.actionsTaken++
  }
}
