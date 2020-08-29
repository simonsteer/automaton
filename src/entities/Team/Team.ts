import { TeamSplitConfig, TeamConfig, TeamRelationshipType } from './types'
import { Unit, Grid } from '..'
import { Deployment } from '../../services'

export default class Team {
  readonly id = Symbol()

  private hostile = new Set<Team>()
  private friendly = new Set<Team>()
  private parent?: Team
  private units = new Set<Unit>()
  private children = new Set<Team>()

  constructor(
    {
      parent,
      hostile = [],
      friendly = [],
      neutral = [],
      wildcard = [],
    } = {} as TeamConfig
  ) {
    this.changeRelationship(this, 'friendly')
    if (parent) {
      this.parent = parent
      this.changeRelationship(parent, 'friendly')
    }
    hostile.forEach(team => this.changeRelationship(team, 'hostile'))
    friendly.forEach(team => this.changeRelationship(team, 'friendly'))
    wildcard.forEach(team => this.changeRelationship(team, 'wildcard'))
    neutral.forEach(team => this.changeRelationship(team, 'neutral'))
  }

  /**
   * Declaratively creates child teams and their relationships at any level of nesting.
   *
   * @arguments
   * `number` – n children will be created, which by default are friendly to the parent team and each other.
   *
   * `TeamRelationshipType` – a child will be created with the passed in relationship to the parent team.
   *
   * `TeamSplitConfig` – an object with the option to specify `parentRelationship` and `siblingRelationship` (default is friendly),
   * as well as any further `splits` you wish to perform.
   * @returns
   * `Team` (self)
   */
  split = (params = 1 as TeamSplitConfig) => {
    const newTeams: Team[] = []

    switch (typeof params) {
      case 'number': {
        if (params < 1)
          throw new Error(
            `Team Splits must have at least a single branch. Received value: ${params}`
          )
        for (let i = 0; i < params; i++) {
          const newTeam = this.clone({
            parent: this,
          }).changeRelationship(this, 'friendly')
          if (i === params - 1)
            newTeams.forEach(team =>
              team.changeRelationship(newTeam, 'friendly')
            )

          newTeams.push(newTeam)
          this.children.add(newTeam)
        }
        break
      }
      case 'string': {
        const newTeam = this.clone().changeRelationship(this, params)
        newTeams.push(newTeam)
        break
      }
      default: {
        const {
          splits,
          parentRelationship = 'friendly',
          siblingRelationship = 'friendly',
        } = params

        if (typeof splits === 'number') {
          if (splits < 1)
            throw new Error(
              `Team Splits must have at least a single branch. Received value: ${splits}`
            )

          for (let i = 0; i < splits; i++) {
            const newTeam = this.clone().changeRelationship(
              this,
              parentRelationship
            )

            if (i === splits - 1)
              newTeams.forEach(team =>
                team.changeRelationship(newTeam, siblingRelationship)
              )

            newTeams.push(newTeam)
          }
        } else {
          if (splits.length < 1)
            throw new Error(
              `Team Splits must have at least a single branch. Received ${splits.length} branches.`
            )

          splits.forEach((config, i) => {
            const newTeam = this.clone()
              .changeRelationship(this, parentRelationship)
              .split(config)

            if (i === splits.length - 1)
              newTeams.forEach(team =>
                team.changeRelationship(newTeam, siblingRelationship)
              )

            newTeams.push(newTeam)
          })
        }
        break
      }
    }

    newTeams.forEach(this.addChild)
    return this
  }

  /**
   * Makes another team its child.
   * @returns
   * `Team` (self)
   */
  addChild = (team: Team) => {
    team.parent = this
    this.children.add(team)
    return this
  }

  /**
   * Makes multiple teams its children.
   * @returns
   * `Team` (self)
   */
  addChildren = (teams: Team[]) => {
    teams.forEach(this.addChild)
    return this
  }

  /**
   * Removes a team from its roster of children. The team in question will be parentless unless assigned a new parent team.
   * @returns
   * `Team` (self)
   */
  removeChild = (team: Team) => {
    if (this.children.delete(team)) {
      team.parent = undefined
    }
    return this
  }

  /**
   * Removes multiple teams from its roster of children. The teams in question will be parentless unless assigned new parent teams.
   * @returns
   * `Team` (self)
   */
  removeChildren = (teams = this.getChildren(true)) => {
    teams.forEach(this.removeChild)
    return this
  }

  /**
   * Returns the parent team.
   * Passing `true` as a second argument will recursively search up the inheritance chain until the original parent is found.
   * @returns
   * `Team`
   */
  getParent = (recursive = false): Team =>
    recursive ? this.parent?.getParent(true) || this : this.parent || this

  /**
   * Returns an array of teams which are children of the team.
   * Passing `true` as a second argument will recursively include all the team's child teams in this array.
   * @returns
   * `Team[]`
   */
  getChildren = (recursive = false) =>
    [...this.children.values()].reduce((acc, team) => {
      recursive ? acc.push(team, ...team.getChildren(true)) : acc.push(team)
      return acc
    }, [] as Team[])

  /**
   * Returns an array of units which belong to the team.
   * Passing `true` as a second argument will recursively include all the team's children's units in this array.
   * @returns
   * `Unit[]`
   */
  getUnits = (recursive = false) => {
    const thisUnits = [...this.units.values()]
    return recursive
      ? [...this.getChildren(true)].reduce((units, team) => {
          units.push(...team.getUnits())
          return units
        }, thisUnits)
      : thisUnits
  }

  /**
   * Returns an array of deployments which belong to the team on a given grid.
   * Passing `true` as a second argument will recursively include all the team's children's deployments in this array.
   * @returns
   * `Deployment[]`
   */
  getDeployments = (grid: Grid, recursive = false) => {
    let units = [...this.units]
    if (recursive) {
      units = [...this.getChildren(true)].reduce((acc, team) => {
        acc.push(...team.units)
        return acc
      }, units)
    }
    return units
      .map(unit => grid.getDeployment(unit.id))
      .filter(Boolean) as Deployment[]
  }

  /**
   * Change the relationship between another team.
   * @returns
   * `Team` (self)
   */
  changeRelationship = (team: Team, relationship: TeamRelationshipType) => {
    switch (relationship) {
      case 'friendly':
        this.changeRelationship(team, 'neutral')
        this.friendly.add(team)
        team.friendly.add(this)
        break
      case 'hostile':
        this.changeRelationship(team, 'neutral')
        this.hostile.add(team)
        team.hostile.add(this)
        break
      case 'neutral':
        this.hostile.delete(team)
        this.friendly.delete(team)
        team.hostile.delete(this)
        team.friendly.delete(this)
        break
      case 'wildcard':
        this.hostile.add(team)
        this.friendly.add(team)
        team.hostile.add(this)
        team.friendly.add(this)
        break
      default:
        break
    }
    return this
  }

  /**
   * Check to see if another team is a child or parent, or if they are neutral/hostile/etc.
   * Passing `true` or `false` as a third argument affects whether to recursively check for child/parent relationships only
   * @returns
   * `boolean`
   */
  is = (
    relationshipType: TeamRelationshipType | 'parent' | 'child',
    team: Team,
    recursive?: boolean
  ): boolean => {
    switch (relationshipType) {
      case 'neutral':
        return !this.is('friendly', team) && !this.is('hostile', team)
      case 'wildcard':
        return this.is('friendly', team) && this.is('hostile', team)
      case 'hostile':
        return this.hostile.has(team) || !!this.parent?.is('hostile', team)
      case 'friendly':
        return this.friendly.has(team) || !!this.parent?.is('friendly', team)
      case 'parent':
        return team.getParent(recursive).id === this.id
      default:
        return this.getChildren(recursive).some(child => child.id === team.id)
    }
  }

  /**
   * Clone the team with optional constructor overrides.
   * @returns
   * `Team` (new)
   */
  clone = (overrides = {} as TeamConfig) =>
    new Team({
      parent: this.parent,
      hostile: [...this.hostile],
      friendly: [...this.friendly],
      ...overrides,
    })

  /*
  The methods below are intentionally and unused in this class
  
  Unit.ts accesses these methods using strings as indexes. This is because
  units need to be aware of these methods for the purpose of updating what
  team it belongs to, but these methods shouldn't be exposed to developers
  using the framework, since using them on their own may lead to
  inconsistent game data.
  */
  private __addUnit = (unit: Unit) => {
    this.units.add(unit)
    return this
  }
  private __removeUnit = (unit: Unit) => {
    this.units.delete(unit)
    return this
  }
}
