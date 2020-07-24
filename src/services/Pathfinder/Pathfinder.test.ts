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
      // |__|√_|√_|√_|__|
      // |√_|√_|√_|__|__|
      // |√_|√_|__|__|__|
      // |√_|__|__|__|__|
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

    it('can get reachable coordinates with simple movement constraints and complex terrain', () => {
      const unit = new Unit(game, {
        team,
        stats: {
          movement: 3,
        },
      })
      const terrain = new Terrain(game, () => 3)
      const grid = createSimpleGrid(game, 5).add.units([[unit, { x: 0, y: 0 }]])
      grid.graph[1][1] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 1, y: 1 }),
      }
      grid.graph[2][1] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 1, y: 2 }),
      }

      //  __ __ __ __ __
      // |__|√_|√_|√_|__|
      // |√_|__|√_|__|__|
      // |√_|__|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const expected = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
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
