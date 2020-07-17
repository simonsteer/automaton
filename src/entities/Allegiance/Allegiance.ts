import Base from '../Base'
import { FactionConfig, AllegianceOpts } from './types'

export default class Allegiance extends Base {
  private hostile = new Set<Allegiance>()
  private friendly = new Set<Allegiance>()
  private parent?: Allegiance

  factions: Allegiance[] = []

  constructor(
    game: Game,
    { parent, hostile = [], friendly = [] } = {} as AllegianceOpts
  ) {
    super(game)
    this.make.friendly(this)
    if (parent) {
      this.parent = parent
      this.make.friendly(parent)
    }
    hostile.forEach(this.make.hostile)
    friendly.forEach(this.make.friendly)
  }

  getUnits = () => {
    const units: Unit[] = []
    for (const [_, unit] of this.game.entities.units) {
      if (unit.allegiance.id === this.id) units.push(unit)
    }
    return units
  }

  createFactions = (config: FactionConfig) =>
    this.recursivelyCreateFactions(config)

  make = {
    hostile: (allegiance: Allegiance) => {
      this.make.neutral(allegiance)
      this.hostile.add(allegiance)
      allegiance.hostile.add(this)
      return this
    },
    friendly: (allegiance: Allegiance) => {
      this.make.neutral(allegiance)
      this.friendly.add(allegiance)
      allegiance.friendly.add(this)
      return this
    },
    neutral: (allegiance: Allegiance) => {
      this.hostile.delete(allegiance)
      this.friendly.delete(allegiance)
      allegiance.hostile.delete(this)
      allegiance.friendly.delete(this)
      return this
    },
    wildcard: (allegiance: Allegiance) => {
      this.hostile.add(allegiance)
      this.friendly.add(allegiance)
      allegiance.hostile.add(this)
      allegiance.friendly.add(this)
      return this
    },
  }

  is = {
    friendly: (allegiance: Allegiance): boolean =>
      this.friendly.has(allegiance) || !!this.parent?.is.friendly(allegiance),
    hostile: (allegiance: Allegiance): boolean =>
      this.hostile.has(allegiance) || !!this.parent?.is.hostile(allegiance),
    neutral: (allegiance: Allegiance) =>
      !this.is.friendly(allegiance) && !this.is.hostile(allegiance),
    wildcard: (allegiance: Allegiance) =>
      this.is.friendly(allegiance) && this.is.hostile(allegiance),
  }

  private clone = (overrides = {} as AllegianceOpts) => {
    return new Allegiance(this.game, {
      parent: this.parent,
      hostile: [...this.hostile],
      friendly: [...this.friendly],
      ...overrides,
    })
  }

  private recursivelyCreateFactions = ({
    branches,
    parentRelationship = 'friendly',
    siblingRelationship = 'friendly',
  }: FactionConfig) => {
    const newFactions: Allegiance[] = []

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
          .recursivelyCreateFactions(config)

        if (i === branches.length - 1)
          newFactions.forEach(faction =>
            faction.make[siblingRelationship](newFaction)
          )

        newFactions.push(newFaction)
      })
    }

    this.factions.push(...newFactions)

    return this
  }
}
