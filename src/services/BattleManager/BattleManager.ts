import TurnManager from './TurnManager'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

const DEFAULT_END_CONDITION: BattleManagerCallback<boolean> = battle =>
  battle.grid.get.teams().length === 1

export default class BattleManager {
  turn = -1
  grid: Grid
  game: Game
  endCondition: BattleManagerCallback<boolean>
  private didStart = false
  private callbacks: {
    onTurnStart: BattleManagerCallback
    onTurnEnd: BattleManagerCallback
  }

  constructor(
    game: Game,
    grid: Grid,
    {
      onTurnStart = () => {},
      onTurnEnd = () => {},
      endCondition = DEFAULT_END_CONDITION,
    } = {} as Partial<BattleManager['callbacks']> & {
      endCondition?: BattleManagerCallback<boolean>
    }
  ) {
    this.game = game
    this.grid = grid
    this.endCondition = endCondition
    this.callbacks = { onTurnStart, onTurnEnd }
  }

  get inProgress() {
    return this.didStart && !this.endCondition(this)
  }

  *begin() {
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
}
