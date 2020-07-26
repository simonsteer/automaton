import compact from 'lodash/compact'

export default class TurnManager {
  battle: BattleManager
  team: Team

  private unitData = new Map<
    Symbol,
    { maxActions: number; actionsTaken: number }
  >(
    this.battle.grid.get.pathfinders().map(pathfinder => {
      const { maxActions } = pathfinder.unit.get.stats()
      return [pathfinder.unit.id, { pathfinder, actionsTaken: 0, maxActions }]
    })
  )

  actionableUnits: ReturnType<TurnManager['getActionableUnits']>

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = battle.get.teams()
    this.team = teams[battle.turn % teams.length]
    this.actionableUnits = this.getActionableUnits()
  }

  private getActionableUnits() {
    return compact(
      [...this.unitData].map(([unitId, { actionsTaken, maxActions }]) => {
        const pathfinder = this.battle.grid.get.pathfinder(unitId)
        if (!pathfinder) return null

        const { unit } = pathfinder

        return {
          pathfinder,
          unit,
          actionsTaken,
          maxActions,
          actions: {
            move: this.createAction(unit.id, (path: RawCoords[]) => {
              pathfinder.move(path)
            }),
            custom: (callback: () => void) => {
              return this.createAction(unit.id, callback)()
            },
          },
        }
      })
    )
  }

  private createAction = <Callback extends (...args: any) => void>(
    unitId: Symbol,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    callback(...args)
    this.incrementActionsTaken(unitId)
    this.updateActionableUnits()
    return this.actionableUnits
  }

  private updateActionableUnits() {
    if (!this.battle.inProgress) {
      this.actionableUnits = []
    }
    this.actionableUnits = this.actionableUnits.filter(
      ({ actionsTaken, maxActions }) => actionsTaken < maxActions
    )
  }

  private incrementActionsTaken(unitId: Symbol) {
    const unitData = this.unitData.get(unitId)
    if (unitData) unitData.actionsTaken++
  }
}
