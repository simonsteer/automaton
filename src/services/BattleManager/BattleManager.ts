import { TurnManager } from './services'
import { Grid, Team } from '../../entities'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

const DEFAULT_END_CONDITION = (battle: BattleManager) =>
  battle.grid.getTeams().length === 1

type Regenerator = Generator<
  {
    turn: number
    team: Team
    units: ReturnType<TurnManager['getActionableUnits']>
  },
  null,
  Regenerator
>

export default class BattleManager {
  private didStart = false
  turn = -1
  grid: Grid
  endCondition: BattleManagerCallback<boolean>
  regenerator?: ReturnType<BattleManager['start']>

  constructor(
    grid: Grid,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: BattleManagerCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  get inProgress() {
    return this.didStart && !this.endCondition(this)
  }

  *start(): Regenerator {
    while (!this.didStart || this.inProgress) {
      if (!this.didStart) this.didStart = true
      this.turn++
      const turn = new TurnManager(this)
      this.regenerator = yield {
        turn: this.turn,
        team: turn.team,
        units: turn.getActionableUnits(),
      }
    }

    return null
  }
}
