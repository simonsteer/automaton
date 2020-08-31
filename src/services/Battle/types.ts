import { Team } from '../..'
export type BattleEvents = {
  battleStart: () => void
  battleEnd: () => void
  nextTurn: <T extends Team = Team>(activeTeam: T) => void
}
