import Team from './Team'
import Game from '../Game'
import { Unit } from '..'

describe('Team', () => {
  const game = new Game()

  const team_1 = new Team()
  const team_2 = new Team()
  const team_1_unit = new Unit({ team: team_1 })

  it('can retrieve units associated with the team', () => {
    const units = team_1.getUnits(true)

    expect(units.length).toBe(1)
    expect(units[0]).toEqual(team_1_unit)
  })

  it('by default is neutral to other teams', () => {
    expect(team_1.isNeutral(team_2)).toBe(true)
  })

  it("let's you define hostile relationships between other teams", () => {
    team_2.changeRelationship(team_1, 'hostile')
    expect(team_1.isHostile(team_2)).toBe(true)
  })

  it("let's you define friendly relationships between other teams", () => {
    team_2.changeRelationship(team_1, 'friendly')
    expect(team_1.isFriendly(team_2)).toBe(true)
  })

  it("let's you define wildcard relationships between other teams", () => {
    team_2.changeRelationship(team_1, 'wildcard')
    expect(team_1.isWildcard(team_2)).toBe(true)
  })

  describe('declaratively creating teams within teams', () => {
    beforeEach(() => team_1.removeChildren())
    afterEach(() => team_1.removeChildren())

    it('can create teams within teams', () => {
      team_1.split(2)
      expect(team_1.getChildren().length).toBe(2)
    })

    it('can define relationships between teams and their parent teams', () => {
      team_1.split({
        branches: 2,
        parentRelationship: 'wildcard',
      })

      expect(team_1.getChildren()[0].isWildcard(team_1)).toBe(true)
      expect(team_1.getChildren()[1].isWildcard(team_1)).toBe(true)
    })

    it('can define relationships between sibling teams', () => {
      team_1.split({
        branches: 2,
        siblingRelationship: 'hostile',
      })

      const [faction_1, faction_2] = team_1.getChildren()

      expect(faction_1.isHostile(faction_2)).toBe(true)
      expect(faction_2.isHostile(faction_1)).toBe(true)
    })

    it("can find a team's immediate parent", () => {
      team_1.split(2)
      const [faction_1, faction_2] = team_1.getChildren()

      expect(faction_1.getParent().id).toBe(team_1.id)
      expect(faction_2.getParent().id).toBe(team_1.id)
    })

    describe('recursive team declarations', () => {
      const team_3 = new Team()

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

      const faction_1 = team_3.getChildren()[0]
      const faction_1_sub_faction_1 = faction_1.getChildren()[0]

      const faction_2 = team_3.getChildren()[1]
      const faction_2_sub_faction_1 = faction_2.getChildren()[0]
      const faction_2_sub_faction_2 = faction_2.getChildren()[1]

      it('can recursively create teams within teams', () => {
        expect(team_3.getChildren(true).length).toBe(5)
        expect(team_3.getChildren().length).toBe(2)
        expect(faction_1.getChildren().length).toBe(1)
        expect(faction_2.getChildren().length).toBe(2)
      })

      it('can recursively create parent-child relationships between team and their teams', () => {
        expect(faction_1.isHostile(team_3)).toBe(true)
        expect(faction_1.isWildcard(faction_1_sub_faction_1)).toBe(true)
        expect(faction_2.isHostile(team_3)).toBe(true)
        expect(faction_2.isFriendly(faction_2_sub_faction_1)).toBe(true)
        expect(faction_2.isFriendly(faction_2_sub_faction_2)).toBe(true)
      })

      it('can recursively create sibling relationships between sub teams', () => {
        expect(faction_1.isFriendly(faction_2)).toBe(true)
        expect(faction_2_sub_faction_1.isHostile(faction_2_sub_faction_2)).toBe(
          true
        )
      })

      it("can find a recursively created team's original parent", () => {
        expect(faction_1.getParent(true).id).toBe(team_3.id)
        expect(faction_1_sub_faction_1.getParent(true).id).toBe(team_3.id)
        expect(faction_2.getParent(true).id).toBe(team_3.id)
        expect(faction_2_sub_faction_1.getParent(true).id).toBe(team_3.id)
        expect(faction_2_sub_faction_2.getParent(true).id).toBe(team_3.id)
      })

      it('can recursively retreive units from sub-teams', () => {
        const team_3_unit = new Unit({
          team: team_3,
        })
        const faction_1_unit = new Unit({ team: faction_1 })
        const faction_1_sub_faction_1_unit = new Unit({
          team: faction_1_sub_faction_1,
        })
        const faction_2_unit = new Unit({ team: faction_2 })
        const faction_2_sub_faction_1_unit = new Unit({
          team: faction_2_sub_faction_1,
        })
        const faction_2_sub_faction_2_unit = new Unit({
          team: faction_2_sub_faction_2,
        })

        const team_3_unit_ids = team_3.getUnits(true).map(u => u.id)
        expect(team_3_unit_ids.length).toBe(6)
        expect(team_3_unit_ids).toEqual([
          team_3_unit.id,
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
          faction_2_unit.id,
          faction_2_sub_faction_1_unit.id,
          faction_2_sub_faction_2_unit.id,
        ])

        const faction_1_unit_ids = faction_1.getUnits(true).map(u => u.id)
        expect(faction_1_unit_ids.length).toBe(2)
        expect(faction_1_unit_ids).toEqual([
          faction_1_unit.id,
          faction_1_sub_faction_1_unit.id,
        ])

        const faction_1_sub_faction_1_ids = faction_1_sub_faction_1
          .getUnits(true)
          .map(u => u.id)
        expect(faction_1_sub_faction_1_ids.length).toBe(1)
        expect(faction_1_sub_faction_1_ids).toEqual([
          faction_1_sub_faction_1_unit.id,
        ])

        const faction_2_ids = faction_2.getUnits(true).map(u => u.id)
        expect(faction_2_ids.length).toBe(3)
        expect(faction_2_ids).toEqual([
          faction_2_unit.id,
          faction_2_sub_faction_1_unit.id,
          faction_2_sub_faction_2_unit.id,
        ])

        const faction_2_sub_faction_1_ids = faction_2_sub_faction_1
          .getUnits(true)
          .map(u => u.id)
        expect(faction_2_sub_faction_1_ids.length).toBe(1)
        expect(faction_2_sub_faction_1_ids).toEqual([
          faction_2_sub_faction_1_unit.id,
        ])

        const faction_2_sub_faction_2_ids = faction_2_sub_faction_2
          .getUnits(true)
          .map(u => u.id)
        expect(faction_2_sub_faction_2_ids.length).toBe(1)
        expect(faction_2_sub_faction_2_ids).toEqual([
          faction_2_sub_faction_2_unit.id,
        ])
      })
    })
  })
})
