import Allegiance from './Allegiance'
import Game from '../Game'

describe('Allegiance', () => {
  const game = new Game()

  const allegiance_1 = new Allegiance(game)
  const allegiance_2 = new Allegiance(game)

  it('by default is neutral to other allegiances', () => {
    expect(allegiance_1.isNeutral(allegiance_2)).toBe(true)
  })

  it("let's you define hostile relationships between other Allegiances", () => {
    allegiance_2.makeHostile(allegiance_1)
    expect(allegiance_1.isHostile(allegiance_2)).toBe(true)
  })

  it("let's you define friendly relationships between other Allegiances", () => {
    allegiance_2.makeFriendly(allegiance_1)
    expect(allegiance_1.isFriendly(allegiance_2)).toBe(true)
  })

  it("let's you define wildcard relationships between other Allegiances", () => {
    allegiance_2.makeWildcard(allegiance_1)
    expect(allegiance_1.isWildcard(allegiance_2)).toBe(true)
  })
})
