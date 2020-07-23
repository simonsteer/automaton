import sortBy from 'lodash/sortBy'
import Pathfinder from './Pathfinder'
import { Terrain, Game, Grid, Tile, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'
import { Coords } from '..'

describe('Pathfinder', () => {
  describe('getting reachable coordinates', () => {
    const game = new Game()
    const team = new Team(game)

    it('can get reachable coordinates with simple movement constraints and simple terrain', () => {
      const unit = new Unit(game, {
        team,
        stats: {
          movement: 3,
        },
      })
      const grid = createSimpleGrid(game, 5).add.units([[unit, { x: 0, y: 0 }]])

      //  __ __ __ __ __
      // |__|x_|x_|x_|__|
      // |x_|x_|x_|__|__|
      // |x_|x_|__|__|__|
      // |x_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const expected = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ].map(c => new Coords(c))
      const reachable = pathfinder.get.reachableCoordinates()

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        reachable: sortBy(reachable, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.reachable).toEqual(sorted.expected)
    })
  })
})
