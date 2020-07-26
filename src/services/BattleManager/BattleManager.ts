import TurnManager from './TurnManager'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

export default class BattleManager {
  turn = -1
  grid: Grid
  endCondition: BattleManagerCallback<boolean>
  private didStart = false
  private callbacks: {
    onTurnStart: BattleManagerCallback
    onTurnEnd: BattleManagerCallback
  }

  constructor(
    grid: Grid,
    {
      onTurnStart = () => {},
      onTurnEnd = () => {},
      endCondition = () => false,
    }: Partial<BattleManager['callbacks']> & {
      endCondition?: BattleManagerCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
    this.callbacks = { onTurnStart, onTurnEnd }
  }

  get inProgress() {
    return this.didStart && !this.endCondition(this)
  }

  *start() {
    this.didStart = true
    const { onTurnStart, onTurnEnd } = this.callbacks

    while (this.inProgress) {
      this.turn++
      const turn = new TurnManager(this)

      while (turn.actionableUnits.length > 0) {
        onTurnStart(this)
        yield {
          turn: this.turn,
          team: turn.team,
          units: turn.actionableUnits,
        }
        onTurnEnd(this)
      }
    }

    this.endCondition = () => true
    yield null
  }

  get = this.grid.get
}
