import Base from '../Base'

type AllegianceOpts = {
  hostile?: Allegiance[]
  friendly?: Allegiance[]
  parent?: Allegiance
}

type AllegianceFaction = {
  numFactions: number
  subFactions: AllegianceFaction[]
}

export default class Allegiance extends Base {
  private hostile = new Set<Allegiance>()
  private friendly = new Set<Allegiance>()
  parent?: Allegiance

  constructor(
    game: Game,
    { parent, hostile = [], friendly = [] } = {} as AllegianceOpts
  ) {
    super(game)
    this.makeFriendly(this)
    if (parent) {
      this.parent = parent
      this.makeFriendly(parent)
    }
    hostile.forEach(this.makeHostile)
    friendly.forEach(this.makeFriendly)
  }

  createFactions = (numFactions: number) => {
    const factions: Allegiance[] = []

    for (let i = 0; i < numFactions; i++) {
      const faction = new Allegiance(this.game, { parent: this })
      if (i > 0) {
        factions[i - 1].makeHostile(faction)
      }
      factions.push(faction)
    }

    return factions
  }

  makeHostile = (allegiance: Allegiance) => {
    this.makeNeutral(allegiance)
    this.hostile.add(allegiance)
    allegiance.hostile.add(this)
    return this
  }

  makeFriendly = (allegiance: Allegiance) => {
    this.makeNeutral(allegiance)
    this.friendly.add(allegiance)
    allegiance.friendly.add(this)
    return this
  }

  makeNeutral = (allegiance: Allegiance) => {
    this.hostile.delete(allegiance)
    this.friendly.delete(allegiance)
    allegiance.hostile.delete(this)
    allegiance.friendly.delete(this)
    return this
  }

  makeWildcard = (allegiance: Allegiance) => {
    this.hostile.add(allegiance)
    this.friendly.add(allegiance)
    allegiance.hostile.add(this)
    allegiance.friendly.add(this)
    return this
  }

  isFriendly = (allegiance: Allegiance): boolean =>
    this.friendly.has(allegiance) || !!this.parent?.isFriendly(allegiance)

  isHostile = (allegiance: Allegiance): boolean =>
    this.hostile.has(allegiance) || !!this.parent?.isHostile(allegiance)

  isWildcard = (allegiance: Allegiance) =>
    this.isFriendly(allegiance) && this.isHostile(allegiance)

  isNeutral = (allegiance: Allegiance) =>
    !this.isFriendly(allegiance) && !this.isHostile(allegiance)
}
