import { Team } from '../..'

export type BattleEvents = {
  battleStart: () => void
  battleEnd: () => void
  nextTurn: (activeTeam: Team) => void
}
