import { BattleManager } from '..'
import TurnManager, { ActionableUnit } from './services/TurnManager'

export type BattleEvents = {
  battleStart: () => void
  battleEnd: () => void
  nextTurn: ({
    team,
    turnIndex,
    actionableUnits,
  }: ReturnType<BattleManager['getNextTurn']>) => void
  actionableUnitChanged: (
    actionableUnit: ReturnType<TurnManager['mapActionsToPathfinder']>
  ) => void
  actionableUnitsChanged: (actionableUnits: ActionableUnit[]) => void
}
