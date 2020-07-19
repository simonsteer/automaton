import Base from '../Base'
import { TeamSplitConfig, TeamConfig, TeamRelationshipType } from './types'

export default class Team extends Base {
  private hostile = new Set<Team>()
  private friendly = new Set<Team>()
  private parent?: Team
  units = new Set<Symbol>()

  factions: Team[] = []

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
    const newFactions: Team[] = []

    switch (typeof params) {
      case 'number': {
        if (params < 1)
          throw new Error(
            `Factions must have at least a single branch. Received value: ${params}`
          )
        for (let i = 0; i < params; i++) {
          const newFaction = this.clone({
            parent: this,
          }).make.friendly(this)
          if (i === params - 1)
            newFactions.forEach(faction => faction.make.friendly(newFaction))

          newFactions.push(newFaction)
        }
        break
      }
      case 'string': {
        const newFaction = this.clone({ parent: this }).make[params](this)
        newFactions.push(newFaction)
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
              `Factions must have at least a single branch. Received value: ${branches}`
            )

          for (let i = 0; i < branches; i++) {
            const newFaction = this.clone({ parent: this }).make[
              parentRelationship
            ](this)

            if (i === branches - 1)
              newFactions.forEach(faction =>
                faction.make[siblingRelationship](newFaction)
              )

            newFactions.push(newFaction)
          }
        } else {
          if (branches.length < 1)
            throw new Error(
              `Factions must have at least a single branch. Received ${branches.length} branches.`
            )

          branches.forEach((config, i) => {
            const newFaction = this.clone({ parent: this })
              .make[parentRelationship](this)
              .split(config)

            if (i === branches.length - 1)
              newFactions.forEach(faction =>
                faction.make[siblingRelationship](newFaction)
              )

            newFactions.push(newFaction)
          })
        }
        break
      }
    }

    this.factions.push(...newFactions)
    return this
  }

  get = {
    units: () =>
      this.factions
        .reduce((acc, faction) => {
          acc.push(...faction.get.units())
          return acc
        }, [...this.units].map(this.game.get.unit))
        .filter(Boolean) as Unit[],
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
