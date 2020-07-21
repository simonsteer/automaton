import compact from 'lodash/compact'
import Base from '../Base'
import { TeamSplitConfig, TeamConfig } from './types'

export default class Team extends Base {
  private hostile = new Set<Team>()
  private friendly = new Set<Team>()
  private parent?: Team
  private units = new Set<Symbol>()
  private children = new Set<Symbol>()

  constructor(
    game: Game,
    { parent, hostile = [], friendly = [] } = {} as TeamConfig
  ) {
    super(game, 'team')
    this.make.friendly(this)
    if (parent) {
      this.parent = parent
      this.make.friendly(parent)
    }
    hostile.forEach(this.make.hostile)
    friendly.forEach(this.make.friendly)
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
          }).make.friendly(this)
          if (i === params - 1)
            newTeams.forEach(team => team.make.friendly(newTeam))

          newTeams.push(newTeam)
          this.children.add(newTeam.id)
        }
        break
      }
      case 'string': {
        const newTeam = this.clone({ parent: this }).make[params](this)
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
            const newTeam = this.clone({ parent: this }).make[
              parentRelationship
            ](this)

            if (i === branches - 1)
              newTeams.forEach(team => team.make[siblingRelationship](newTeam))

            newTeams.push(newTeam)
          }
        } else {
          if (branches.length < 1)
            throw new Error(
              `Team Splits must have at least a single branch. Received ${branches.length} branches.`
            )

          branches.forEach((config, i) => {
            const newTeam = this.clone({ parent: this })
              .make[parentRelationship](this)
              .split(config)

            if (i === branches.length - 1)
              newTeams.forEach(team => team.make[siblingRelationship](newTeam))

            newTeams.push(newTeam)
          })
        }
        break
      }
    }

    newTeams.forEach(this.add.child)
    return this
  }

  add = {
    unit: (unit: Unit) => {
      this.units.add(unit.id)
      return this
    },
    child: (team: Team) => {
      this.children.add(team.id)
      return this
    },
    children: (teams: Team[]) => {
      teams.forEach(this.add.child)
      return this
    },
  }

  remove = {
    unit: (unit: Unit) => {
      this.units.delete(unit.id)
      return this
    },
    child: (team: Team) => {
      this.children.delete(team.id)
      return this
    },
    children: (teams?: Team[]) => {
      const teamIds = teams?.map(team => team.id)
      this.get
        .children()
        .filter(team => !teamIds || teamIds.includes(team.id))
        .forEach(this.remove.child)
      return this
    },
  }

  get = {
    parent: (recursive = false): Team =>
      recursive ? this.parent?.get.parent(true) || this : this.parent || this,
    children: (recursive = false) =>
      [...this.children].reduce((acc, teamId) => {
        const team = this.game.get.team(teamId)
        if (team) {
          recursive
            ? acc.push(team, ...team.get.children(true))
            : acc.push(team)
        }
        return acc
      }, [] as Team[]),
    units: (recursive = false) => {
      const thisUnits = [...this.units].map(this.game.get.unit)

      return compact(
        recursive
          ? [...this.get.children(true)].reduce((units, team) => {
              units.push(...team.get.units())
              return units
            }, thisUnits)
          : thisUnits
      )
    },
  }

  make = {
    hostile: (team: Team) => {
      this.make.neutral(team)
      this.hostile.add(team)
      team.hostile.add(this)
      return this
    },
    friendly: (team: Team) => {
      this.make.neutral(team)
      this.friendly.add(team)
      team.friendly.add(this)
      return this
    },
    neutral: (team: Team) => {
      this.hostile.delete(team)
      this.friendly.delete(team)
      team.hostile.delete(this)
      team.friendly.delete(this)
      return this
    },
    wildcard: (team: Team) => {
      this.hostile.add(team)
      this.friendly.add(team)
      team.hostile.add(this)
      team.friendly.add(this)
      return this
    },
  }

  is = {
    child: (team: Team, recursive = false) =>
      this.get.children(recursive).some(child => child.id === team.id),
    parent: (team: Team, recursive = false) =>
      team.get.parent(recursive).id === this.id,
    friendly: (team: Team): boolean =>
      this.friendly.has(team) || !!this.parent?.is.friendly(team),
    hostile: (team: Team): boolean =>
      this.hostile.has(team) || !!this.parent?.is.hostile(team),
    neutral: (team: Team) => !this.is.friendly(team) && !this.is.hostile(team),
    wildcard: (team: Team) => this.is.friendly(team) && this.is.hostile(team),
  }

  private clone = (overrides = {} as TeamConfig) => {
    return new Team(this.game, {
      parent: this.parent,
      hostile: [...this.hostile],
      friendly: [...this.friendly],
      ...overrides,
    })
  }
}
