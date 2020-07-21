import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

type UnitConstructorOptions<CustomActions extends FunctionMap> = {
  team: Team
  stats?: Partial<UnitStats>
  customActions?: CustomActions
}

type BaseUnitActions = {
  move: (coordsA: Coords, coordsB: Coords) => void
}

export default class Unit<
  CustomActions extends {
    [key: string]: (...args: any[]) => void
  } = {}
> extends Base {
  private stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    movement: 1,
    maxHealth: 1,
    maxActions: 1,
  }
  private team!: Team
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )
  actions: BaseUnitActions & CustomActions

  constructor(
    game: Game,
    {
      team,
      stats = {},
      customActions = {} as CustomActions,
    }: UnitConstructorOptions<CustomActions>
  ) {
    super(game, 'unit')
    this.set.team(team)
    this.set.stats(stats)
    this.actions = {
      ...customActions,
      move: (coordsA: Coords, coordsB: Coords) => {},
    }
  }

  get = {
    stats: () => this.stats,
    team: () => this.team,
  }

  set = {
    stats: (updates: Partial<Unit<CustomActions>['stats']>) => {
      this.stats = { ...this.stats, ...updates }
      return this
    },
    team: (team: Team) => {
      this.team?.remove.unit(this)
      this.team = team
      this.team.add.unit(this)
      return this
    },
    actions: <Actions extends FunctionMap>(actions: Actions) => {
      this.actions = { ...this.actions, ...actions }
      return this as Unit<CustomActions & Actions>
    },
  }
}
