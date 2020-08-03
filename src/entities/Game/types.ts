import { BattleManagerState } from '../../services/BattleManager/types'

export type GameEvents = {
  battleStart: (grid: Grid) => void
  battleTurnStart: (state: BattleManagerState) => void
  battleTurnEnd: (state: BattleManagerState) => void
  battleEnd: (grid: Grid) => void
}
