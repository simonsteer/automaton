import Team from './Team'
import Game from '../Game'
import { Unit } from '..'

describe('Team', () => {
  const game = new Game()

  const team_1 = new Team(game)
  const team_2 = new Team(game)
  const team_1_unit = new Unit(game, { team: team_1 })

  it('can retrieve units associated with the team', () => {
    const units = team_1.get.units()

    expect(units.length).toBe(1)
    expect(units[0]).toEqual(team_1_unit)
  })

  it('by default is neutral to other teams', () => {
    expect(team_1.is.neutral(team_2)).toBe(true)
  })

  it("let's you define hostile relationships between other teams", () => {
    team_2.make.hostile(team_1)
    expect(team_1.is.hostile(team_2)).toBe(true)
  })

  it("let's you define friendly relationships between other teams", () => {
    team_2.make.friendly(team_1)
    expect(team_1.is.friendly(team_2)).toBe(true)
  })

  it("let's you define wildcard relationships between other teams", () => {
    team_2.make.wildcard(team_1)
    expect(team_1.is.wildcard(team_2)).toBe(true)
  })

  describe('declaratively creating factions within teams', () => {
    beforeEach(() => (team_1.factions = []))
    afterEach(() => (team_1.factions = []))

    it('can create factions within teams', () => {
      team_1.split(2)
      expect(team_1.factions.length).toBe(2)
    })

    it('can define relationships between factions and their parent teams', () => {
      team_1.split({
        branches: 2,
        parentRelationship: 'wildcard',
      })

      expect(team_1.factions[0].is.wildcard(team_1)).toBe(true)
      expect(team_1.factions[1].is.wildcard(team_1)).toBe(true)
    })

    it('can define relationships between sibling factions', () => {
      team_1.split({
        branches: 2,
        siblingRelationship: 'hostile',
      })

      const [faction_1, faction_2] = team_1.factions

      expect(faction_1.is.hostile(faction_2)).toBe(true)
      expect(faction_2.is.hostile(faction_1)).toBe(true)
    })

    describe('recursive faction declarations', () => {
      const team_3 = new Team(game)

      team_3.split({
        branches: [
          'wildcard',
          {
            branches: 2,
            siblingRelationship: 'hostile',
          },
        ],
        parentRelationship: 'hostile',
      })

      const faction_1 = team_3.factions[0]
      const faction_1_sub_faction_1 = faction_1.factions[0]

      const faction_2 = team_3.factions[1]
      const faction_2_sub_faction_1 = faction_2.factions[0]
      const faction_2_sub_faction_2 = faction_2.factions[1]

      it('can recursively create factions within teams', () => {
        expect(team_3.factions.length).toBe(2)
        expect(faction_1.factions.length).toBe(1)
        expect(faction_2.factions.length).toBe(2)
      })

      it('can recursively create parent-child relationships between team and their factions', () => {
        expect(faction_1.is.hostile(team_3)).toBe(true)
        expect(faction_1.is.wildcard(faction_1_sub_faction_1)).toBe(true)
        expect(faction_2.is.hostile(team_3)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_1)).toBe(true)
        expect(faction_2.is.friendly(faction_2_sub_faction_2)).toBe(true)
      })

      it('can recursively create sibling relationships between team factions', () => {
        expect(faction_1.is.friendly(faction_2)).toBe(true)
        expect(
          faction_2_sub_faction_1.is.hostile(faction_2_sub_faction_2)
        ).toBe(true)
      })

      it('can recursively retreive units from sub-factions', () => {
        const team_3_unit = new Unit(game, { team: team_3 })
        const faction_1_unit = new Unit(game, { team: faction_1 })
        const faction_1_sub_faction_1_unit = new Unit(game, {
          team: faction_1_sub_faction_1,
        })
        const faction_2_unit = new Unit(game, { team: faction_2 })
        const faction_2_sub_faction_1_unit = new Unit(game, {
          team: faction_2_sub_faction_1,
        })
        const faction_2_sub_faction_2_unit = new Unit(game, {
          team: faction_2_sub_faction_2,
        })

        const team_3_unit_ids = team_3.get.units().map(u => u.id)
        expect(team_3_unit_ids.length).toBe(6)
        expect(team_3_unit_ids).toEqual([
          team_3_unit.id,
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
          faction_2_unit.id,
          faction_2_sub_faction_1_unit.id,
          faction_2_sub_faction_2_unit.id,
        ])

        const faction_1_unit_ids = faction_1.get.units().map(u => u.id)
        expect(faction_1_unit_ids.length).toBe(2)
        expect(faction_1_unit_ids).toEqual([
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
        ])

        const faction_1_sub_faction_1_ids = faction_1_sub_faction_1.get
          .units()
          .map(u => u.id)
        expect(faction_1_sub_faction_1_ids.length).toBe(1)
        expect(faction_1_sub_faction_1_ids).toEqual([
          faction_1_sub_faction_1_unit.id,
        ])

        const faction_2_ids = faction_2.get.units().map(u => u.id)
        expect(faction_2_ids.length).toBe(3)
        expect(faction_2_ids).toEqual([
          faction_2_unit.id,
          faction_2_sub_faction_1_unit.id,
          faction_2_sub_faction_2_unit.id,
        ])

        const faction_2_sub_faction_1_ids = faction_2_sub_faction_1.get
          .units()
          .map(u => u.id)
        expect(faction_2_sub_faction_1_ids.length).toBe(1)
        expect(faction_2_sub_faction_1_ids).toEqual([
          faction_2_sub_faction_1_unit.id,
        ])

        const faction_2_sub_faction_2_ids = faction_2_sub_faction_2.get
          .units()
          .map(u => u.id)
        expect(faction_2_sub_faction_2_ids.length).toBe(1)
        expect(faction_2_sub_faction_2_ids).toEqual([
          faction_2_sub_faction_2_unit.id,
        ])
      })
    })
  })
})
