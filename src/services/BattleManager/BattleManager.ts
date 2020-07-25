import TurnManager from './TurnManager'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

export default class BattleManager {
  inProgress = false
  turn = -1
  grid: Grid
  endCondition: BattleManagerCallback<boolean> = () => false
  private callbacks: {
    onTurnStart: BattleManagerCallback
    onTurnEnd: BattleManagerCallback
  }

  constructor(
    grid: Grid,
    {
      onTurnStart = () => {},
      onTurnEnd = () => {},
    }: Partial<BattleManager['callbacks']>
  ) {
    this.grid = grid
    this.callbacks = { onTurnStart, onTurnEnd }
  }

  *start() {
    this.inProgress = true
    while (this.inProgress) {
      const turn = new TurnManager(this)
      const turnGenerator = turn.start()

      this.callbacks.onTurnStart(this)

      let availableUnits = turnGenerator.next().value
      while (availableUnits.length > 0) {
        yield availableUnits
        availableUnits = turnGenerator.next().value
      }

      this.callbacks.onTurnEnd(this)
    }
  }

  get = {
    pathfinder: (unit: Unit) => this.grid.get.pathfinder(unit.id),
    pathfinders: () => this.grid.get.pathfinders(),
    teams: () => this.grid.get.teams(),
  }
}
