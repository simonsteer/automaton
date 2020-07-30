import sortBy from 'lodash/sortBy'
import { Terrain, Game, Tile, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'
import { Coords } from '..'
import DirectionalConstraint from '../DirectionalConstraint'
import { DIAGONAL_MOVEMENT } from '../DirectionalConstraint/recipes'

describe('Pathfinder', () => {
  const game = new Game()
  const team = new Team(game)

  describe('getting reachable coordinates', () => {
    it('can get reachable coordinates with default movement constraints and default terrain', () => {
      const unit = new Unit(game, {
        team,
        movement: { steps: 3 },
      })
      const grid = createSimpleGrid(game, 5).add.units([[unit, { x: 0, y: 0 }]])

      //  __ __ __ __ __
      // |U_|√_|√_|√_|__|
      // |√_|√_|√_|__|__|
      // |√_|√_|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const reachable = pathfinder.get.reachable()
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

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        reachable: sortBy(reachable, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.reachable).toEqual(sorted.expected)
    })

    it('can get reachable coordinates with default movement constraints and custom terrain', () => {
      const unit = new Unit(game, {
        team,
        movement: { steps: 3 },
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
      // |U_|√_|√_|√_|__|
      // |√_|__|√_|__|__|
      // |√_|__|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const reachable = pathfinder.get.reachable()
      const expected = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 1 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        reachable: sortBy(reachable, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.reachable).toEqual(sorted.expected)
    })

    it('can get reachable coordinates with custom movement constraints and default terrain', () => {
      const unit = new Unit(game, {
        team,
        movement: {
          pattern: new DirectionalConstraint(DIAGONAL_MOVEMENT),
          steps: 2,
        },
      })
      const grid = createSimpleGrid(game, 5).add.units([[unit, { x: 1, y: 1 }]])

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|√_|__|
      // |√_|__|√_|__|__|
      // |__|√_|__|√_|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const reachable = pathfinder.get.reachable()
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 0 },
        { x: 1, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 1 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        reachable: sortBy(reachable, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.reachable).toEqual(sorted.expected)
    })

    it('can get reachable coordinates with custom movement constraints and custom terrain', () => {
      const unit = new Unit(game, {
        team,
        movement: {
          pattern: new DirectionalConstraint(DIAGONAL_MOVEMENT),
          steps: 3,
        },
      })
      const terrain = new Terrain(game, () => 3)
      const grid = createSimpleGrid(game, 5).add.units([[unit, { x: 1, y: 1 }]])
      grid.graph[1][3] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 3, y: 1 }),
      }
      grid.graph[3][1] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 1, y: 3 }),
      }
      grid.graph[4][4] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 4, y: 4 }),
      }

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|__|__|
      // |√_|__|√_|__|√_|
      // |__|__|__|√_|__|
      // |__|__|√_|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const reachable = pathfinder.get.reachable()
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 0 },
        { x: 3, y: 3 },
        { x: 2, y: 4 },
        { x: 4, y: 2 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        reachable: sortBy(reachable, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.reachable).toEqual(sorted.expected)
    })
  })

  describe('pathfinding for arbitrary coordinates', () => {
    it('can find simple paths', () => {
      const unit = new Unit(game, {
        team,
        movement: { steps: 3 },
      })
      const terrain = new Terrain(game, () => 2)
      const grid = createSimpleGrid(game, 5).add.unit(unit, { x: 0, y: 0 })
      grid.graph[0][1] = {
        tile: new Tile(terrain),
        coords: new Coords({ x: 3, y: 1 }),
      }

      //  __ __ __ __ __
      // |U_|2_|__|__|__|
      // |√_|√_|√_|__|__|
      // |__|__|__|__|__|
      // |__|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit.id)!

      const path = pathfinder.get.route({ x: 2, y: 1 })!
      const expected = [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        path: sortBy(path, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.path).toEqual(sorted.expected)
    })
  })
})
