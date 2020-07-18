import Allegiance from './Allegiance'
import Game from '../Game'
import { Unit } from '..'

describe('Allegiance', () => {
  const game = new Game()

  const allegiance_1 = new Allegiance(game)
  const allegiance_2 = new Allegiance(game)

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
    it('can create factions', () => {
      allegiance_1.factions = []
      allegiance_1.createFactions({
        branches: 2,
      })
      expect(allegiance_1.factions.length).toBe(2)
    })

    it('can define relationships between factions and their parent allegiances', () => {
      allegiance_1.factions = []
      allegiance_1.createFactions({
        branches: 2,
        parentRelationship: 'wildcard',
      })

      expect(allegiance_1.factions[0].is.wildcard(allegiance_1)).toBe(true)
      expect(allegiance_1.factions[1].is.wildcard(allegiance_1)).toBe(true)
    })

    it('can define relationships between sibling factions', () => {
      allegiance_1.factions = []
      allegiance_1.createFactions({
        branches: 2,
        siblingRelationship: 'hostile',
      })

      const [faction_1, faction_2] = allegiance_1.factions

      expect(faction_1.is.hostile(faction_2)).toBe(true)
      expect(faction_2.is.hostile(faction_1)).toBe(true)
    })

    describe('nested faction declarations', () => {
      allegiance_1.factions = []
      allegiance_1.createFactions({
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

      const faction_1 = allegiance_1.factions[0]
      const faction_1_sub_faction_1 = faction_1.factions[0]

      const faction_2 = allegiance_1.factions[1]
      const faction_2_sub_faction_1 = faction_2.factions[0]
      const faction_2_sub_faction_2 = faction_2.factions[1]

      it('can recursively create factions within allegiances', () => {
        expect(allegiance_1.factions.length).toBe(2)
        expect(faction_1.factions.length).toBe(1)
        expect(faction_2.factions.length).toBe(2)
      })

      it('can recursively replicate parent <-> child relationships between allegiance and their factions', () => {
        expect(faction_1.is.hostile(allegiance_1)).toBe(true)
        expect(faction_1.is.wildcard(faction_1_sub_faction_1)).toBe(true)
        expect(faction_2.is.hostile(allegiance_1)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_1)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_2)).toBe(true)
      })

      it('can recursively replicate sibling relationships between allegiance factions', () => {
        expect(faction_1.is.friendly(faction_2)).toBe(true)
        expect(
          faction_2_sub_faction_1.is.hostile(faction_2_sub_faction_2)
        ).toBe(true)
      })
    })
  })
})
