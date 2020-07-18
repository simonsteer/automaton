import Allegiance from './Allegiance'
import Game from '../Game'
import { Unit } from '..'

describe('Allegiance', () => {
  it('human-dragon task force', () => {
    const game = new Game()

    const dragonAllegiance = new Allegiance(game)
    const humanAllegiance = new Allegiance(game)
    humanAllegiance.make.friendly(dragonAllegiance)

    const babby1 = new Unit(game, {
      allegiance: humanAllegiance.createFaction(),
    })
    const babby2 = new Unit(game, {
      allegiance: dragonAllegiance.createFaction(),
    })

    expect(babby1.getAllegiance().is.friendly(dragonAllegiance)).toBe(true)
    expect(babby1.getAllegiance().is.friendly(humanAllegiance)).toBe(true)
    expect(babby2.getAllegiance().is.friendly(dragonAllegiance)).toBe(true)
    expect(babby2.getAllegiance().is.friendly(humanAllegiance)).toBe(true)
  })

  const game = new Game()

  const allegiance_1 = new Allegiance(game)
  const allegiance_2 = new Allegiance(game)
  const allegiance_1_unit = new Unit(game, { allegiance: allegiance_1 })

  it('can retrieve units associated with the allegiance', () => {
    const units = allegiance_1.getUnits()

    expect(units.length).toBe(1)
    expect(units[0]).toEqual(allegiance_1_unit)
  })

  it('by default is neutral to other allegiances', () => {
    expect(allegiance_1.is.neutral(allegiance_2)).toBe(true)
  })

  it("let's you define hostile relationships between other Allegiances", () => {
    allegiance_2.make.hostile(allegiance_1)
    expect(allegiance_1.is.hostile(allegiance_2)).toBe(true)
  })

  it("let's you define friendly relationships between other Allegiances", () => {
    allegiance_2.make.friendly(allegiance_1)
    expect(allegiance_1.is.friendly(allegiance_2)).toBe(true)
  })

  it("let's you define wildcard relationships between other Allegiances", () => {
    allegiance_2.make.wildcard(allegiance_1)
    expect(allegiance_1.is.wildcard(allegiance_2)).toBe(true)
  })

  describe('declaratively creating factions within allegiances', () => {
    beforeEach(() => (allegiance_1.factions = []))
    afterEach(() => (allegiance_1.factions = []))

    it('can create factions', () => {
      allegiance_1.createFactions({
        branches: 2,
      })
      expect(allegiance_1.factions.length).toBe(2)
    })

    it('can define relationships between factions and their parent allegiances', () => {
      allegiance_1.createFactions({
        branches: 2,
        parentRelationship: 'wildcard',
      })

      expect(allegiance_1.factions[0].is.wildcard(allegiance_1)).toBe(true)
      expect(allegiance_1.factions[1].is.wildcard(allegiance_1)).toBe(true)
    })

    it('can define relationships between sibling factions', () => {
      allegiance_1.createFactions({
        branches: 2,
        siblingRelationship: 'hostile',
      })

      const [faction_1, faction_2] = allegiance_1.factions

      expect(faction_1.is.hostile(faction_2)).toBe(true)
      expect(faction_2.is.hostile(faction_1)).toBe(true)
    })

    describe('recursive faction declarations', () => {
      const allegiance_3 = new Allegiance(game)

      allegiance_3.createFactions({
        branches: [
          {
            branches: 1,
            parentRelationship: 'wildcard',
            siblingRelationship: 'hostile',
          },
          {
            branches: 2,
            siblingRelationship: 'hostile',
          },
        ],
        parentRelationship: 'hostile',
      })

      const faction_1 = allegiance_3.factions[0]
      const faction_1_sub_faction_1 = faction_1.factions[0]

      const faction_2 = allegiance_3.factions[1]
      const faction_2_sub_faction_1 = faction_2.factions[0]
      const faction_2_sub_faction_2 = faction_2.factions[1]

      it('can recursively create factions within allegiances', () => {
        expect(allegiance_3.factions.length).toBe(2)
        expect(faction_1.factions.length).toBe(1)
        expect(faction_2.factions.length).toBe(2)
      })

      it('can recursively create parent-child relationships between allegiance and their factions', () => {
        expect(faction_1.is.hostile(allegiance_3)).toBe(true)
        expect(faction_1.is.wildcard(faction_1_sub_faction_1)).toBe(true)
        expect(faction_2.is.hostile(allegiance_3)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_1)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_2)).toBe(true)
      })

      it('can recursively create sibling relationships between allegiance factions', () => {
        expect(faction_1.is.friendly(faction_2)).toBe(true)
        expect(
          faction_2_sub_faction_1.is.hostile(faction_2_sub_faction_2)
        ).toBe(true)
      })

      it('can recursively retreive units from sub-factions', () => {
        const allegiance_3_unit = new Unit(game, { allegiance: allegiance_3 })
        const faction_1_unit = new Unit(game, { allegiance: faction_1 })
        const faction_1_sub_faction_1_unit = new Unit(game, {
          allegiance: faction_1_sub_faction_1,
        })
        const faction_2_unit = new Unit(game, { allegiance: faction_2 })
        const faction_2_sub_faction_1_unit = new Unit(game, {
          allegiance: faction_2_sub_faction_1,
        })
        const faction_2_sub_faction_2_unit = new Unit(game, {
          allegiance: faction_2_sub_faction_2,
        })

        const allegiance_3_unit_ids = allegiance_3.getUnits().map(u => u.id)
        expect(allegiance_3_unit_ids.length).toBe(6)
        expect(allegiance_3_unit_ids).toEqual([
          allegiance_3_unit.id,
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
          faction_2_unit.id,
          faction_2_sub_faction_1_unit.id,
          faction_2_sub_faction_2_unit.id,
        ])

        const faction_1_unit_ids = faction_1.getUnits().map(u => u.id)
        expect(faction_1_unit_ids.length).toBe(2)
        expect(faction_1_unit_ids).toEqual([
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
        ])

        expect(faction_1_sub_faction_1.getUnits().length).toBe(1)
        expect(faction_1_sub_faction_1.getUnits()).toEqual([
          faction_1_sub_faction_1_unit,
        ])

        expect(faction_2.getUnits().length).toBe(3)
      })
    })
  })
})
