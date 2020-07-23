import compact from 'lodash/compact'

export default class TurnManager {
  battle: BattleManager
  team: Team

  private inProgress = false
  private unitData = new Map<
    Symbol,
    { maxActions: number; actionsTaken: number }
  >(
    this.team.get.pathfinders(this.battle.grid, false).map(pathfinder => {
      const { maxActions } = pathfinder.unit.get.stats()
      return [pathfinder.unit.id, { pathfinder, actionsTaken: 0, maxActions }]
    })
  )

  constructor(battle: BattleManager) {
    this.battle = battle
    const teams = battle.get.teams()
    this.team = teams[battle.turn % teams.length]
  }

  *start() {
    this.inProgress = true
    while (this.inProgress) {
      const unitsWithActionsLeft = this.getUsablePathfinders().map(
        pathfinder => {
          return {
            unit: pathfinder.unit,
            pathfinder,
            actions: {
              move: () => {
                this.unitData
                this.incrementActionsTaken(pathfinder.unit.id)
              },
            },
          }
        }
      )

      yield unitsWithActionsLeft
    }
  }

  private getPathfinderActions(pathfinder: Pathfinder) {
    const { unit } = pathfinder

    return {
      unit,
      pathfinder,
      actions: {
        move: () => {
          this.unitData
          this.incrementActionsTaken(unit.id)
        },
      },
    }
  }

  private getUsablePathfinders() {
    return compact(
      [...this.unitData]
        .filter(data => data[1].actionsTaken < data[1].maxActions)
        .map(data => this.battle.grid.get.pathfinder(data[0]))
    )
  }

  private incrementActionsTaken(unitId: Symbol) {
    const unitData = this.unitData.get(unitId)
    if (unitData) unitData.actionsTaken++
  }
}
