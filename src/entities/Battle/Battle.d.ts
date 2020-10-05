import Team from '../Team'
import Grid from '../Grid'

export default class Battle {
  constructor(
    grid: Grid,
    options?: Partial<{
      end_condition: (battle: Battle) => boolean
      team_ordering: Team[]
    }>
  )
  id: string
  grid: Grid
  turn_index: number
  in_progress: boolean
  team_ordering: Team[]
  end_condition: (battle: Battle) => boolean
  active_team(): Team | undefined
  advance(): void
}
