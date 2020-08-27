import { TeamSplitConfig, TeamConfig, TeamRelationshipType } from './types'
import { Unit, Grid } from '..'
import { Deployment } from '../../services'

export default class Team {
  readonly id = Symbol()
  hostile = new Set<Team>()
  friendly = new Set<Team>()
  parent?: Team
  units = new Set<Unit>()
  children = new Set<Team>()

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
          branches,
          parentRelationship = 'friendly',
          siblingRelationship = 'friendly',
        } = params

        if (typeof branches === 'number') {
          if (branches < 1)
            throw new Error(
              `Team Splits must have at least a single branch. Received value: ${branches}`
            )

          for (let i = 0; i < branches; i++) {
            const newTeam = this.clone().changeRelationship(
              this,
              parentRelationship
            )

            if (i === branches - 1)
              newTeams.forEach(team =>
                team.changeRelationship(newTeam, siblingRelationship)
              )

            newTeams.push(newTeam)
          }
        } else {
          if (branches.length < 1)
            throw new Error(
              `Team Splits must have at least a single branch. Received ${branches.length} branches.`
            )

          branches.forEach((config, i) => {
            const newTeam = this.clone()
              .changeRelationship(this, parentRelationship)
              .split(config)

            if (i === branches.length - 1)
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

  addChild = (team: Team) => {
    team.parent = this
    this.children.add(team)
    return this
  }

  addChildren = (teams: Team[]) => {
    teams.forEach(this.addChild)
    return this
  }

  removeChild = (team: Team) => {
    team.parent = undefined
    this.children.delete(team)
    return this
  }

  removeChildren = (teams?: Team[]) => {
    const teamIds = teams?.map(team => team)
    this.getChildren()
      .filter(team => !teamIds || teamIds.includes(team))
      .forEach(this.removeChild)
    return this
  }

  getParent = (recursive = false): Team =>
    recursive ? this.parent?.getParent(true) || this : this.parent || this

  getChildren = (recursive = false) =>
    [...this.children.values()].reduce((acc, team) => {
      recursive ? acc.push(team, ...team.getChildren(true)) : acc.push(team)
      return acc
    }, [] as Team[])

  getUnits = (recursive = false) => {
    const thisUnits = [...this.units.values()]
    return recursive
      ? [...this.getChildren(true)].reduce((units, team) => {
          units.push(...team.getUnits())
          return units
        }, thisUnits)
      : thisUnits
  }

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

  getSize = (recursive = false) => {
    let size = this.units.size
    if (recursive) {
      size =
        size +
        this.getChildren(true).reduce((acc, child) => acc + child.units.size, 0)
    }
    return size
  }

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

  isNeutral = (team: Team) => !this.isFriendly(team) && !this.isHostile(team)

  isWildcard = (team: Team) => this.isFriendly(team) && this.isHostile(team)

  isHostile = (team: Team): boolean =>
    this.hostile.has(team) || !!this.parent?.isHostile(team)

  isFriendly = (team: Team): boolean =>
    this.friendly.has(team) || !!this.parent?.isFriendly(team)

  isParent = (team: Team, recursive = false) =>
    team.getParent(recursive).id === this.id

  isChild = (team: Team, recursive = false) =>
    this.getChildren(recursive).some(child => child.id === team.id)

  clone = (overrides = {} as TeamConfig) => {
    return new Team({
      parent: this.parent,
      hostile: [...this.hostile],
      friendly: [...this.friendly],
      ...overrides,
    })
  }

  /*
  The methods below are intentionally and unused in this class
  
  Unit.ts accesses these methods using strings as indexes. This is because
  units need to be aware of these methods for the purpose of updating what
  team it belongs to, but these methods shouldn't be exposed to developers
  using the framework, since using them on their own may lead to
  inconsistent game data.
  */

  __addUnit = (unit: Unit) => {
    this.units.add(unit)
    return this
  }
  __removeUnit = (unit: Unit) => {
    this.units.delete(unit)
    return this
  }
}
