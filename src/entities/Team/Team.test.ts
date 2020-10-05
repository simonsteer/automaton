import Team from './Team'
import Unit from '../Unit'

describe('Team', () => {
  const team_1 = new Team()
  const team_2 = new Team()
  const team_1_unit = new Unit({ team: team_1 })

  it('can retrieve units associated with the team', () => {
    expect(team_1.units.length).toBe(1)
    expect(team_1.units[0]).toEqual(team_1_unit)
  })

  it('by default is neutral to other teams', () => {
    expect(team_1.is(team_2, 'neutral')).toBe(true)
  })

  it("let's you define hostile relationships between other teams", () => {
    team_2.change_relationship(team_1, 'hostile')
    expect(team_1.is(team_2, 'hostile')).toBe(true)
  })

  it("let's you define friendly relationships between other teams", () => {
    team_2.change_relationship(team_1, 'friendly')
    expect(team_1.is(team_2, 'friendly')).toBe(true)
  })

  it("let's you define wildcard relationships between other teams", () => {
    team_2.change_relationship(team_1, 'wildcard')
    expect(team_1.is(team_2, 'wildcard')).toBe(true)
  })
})
