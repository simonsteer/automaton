import compact from 'lodash/compact'

type GeneratedPathfinderWithActions = {
  pathfinder: Pathfinder
  actions: {
    move: (path: RawCoords[]) => GeneratedPathfinderWithActions[]
    custom: (callback: () => void) => GeneratedPathfinderWithActions[]
  }
}

type PathfindersWithActionsGenerator = Generator<
  GeneratedPathfinderWithActions[],
  GeneratedPathfinderWithActions[]
>

export default class TurnManager {
  battle: BattleManager
  team: Team

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

  *start(): PathfindersWithActionsGenerator {
    while (true) {
      yield this.mappedPathfinders
    }
  }

  private get mappedPathfinders() {
    return this.usablePathfinders.map(pathfinder =>
      this.mapActionsToPathfinder(pathfinder, this.start())
    )
  }

  private get usablePathfinders() {
    return compact(
      [...this.unitData]
        .filter(data => data[1].actionsTaken < data[1].maxActions)
        .map(data => this.battle.grid.get.pathfinder(data[0]))
    )
  }

  private mapActionsToPathfinder(
    pathfinder: Pathfinder,
    generator: PathfindersWithActionsGenerator
  ) {
    const { unit } = pathfinder

    return {
      pathfinder,
      actions: {
        move: this.action(generator, unit, (path: RawCoords[]) => {
          pathfinder.commit(path)
        }),
        custom: (callback: () => void) => {
          return this.action(generator, unit, callback)()
        },
      },
    }
  }

  private action = <Callback extends (...args: any) => void>(
    generator: Generator,
    unit: Unit,
    callback: Callback
  ) => (...args: Parameters<Callback>) => {
    callback(...args)
    this.incrementActionsTaken(unit.id)
    return generator.next().value
  }

  private incrementActionsTaken(unitId: Symbol) {
    const unitData = this.unitData.get(unitId)
    if (unitData) unitData.actionsTaken++
  }
}
