import sortBy from 'lodash/sortBy'
import { Terrain, Game, Tile, Unit, Grid } from '../../entities'
import { createSimpleGraph } from '../../utils'
import Team from '../../entities/Team'
import { Coords } from '..'
import RangeConstraint from '../RangeConstraint'
import { SIMPLE_DIAGONAL_CONSTRAINT } from '../../recipes/constraints'

describe('Pathfinder', () => {
  const game = new Game()
  const team = new Team()

  describe('getting reachable coordinates', () => {
    it('can get reachable coordinates with default movement constraints and default terrain', () => {
      const unit = new Unit({ team, movement: { steps: 3 } })
      const grid = new Grid({
        graph: createSimpleGraph(5),
      }).add.units([[unit, { x: 0, y: 0 }]])

      //  __ __ __ __ __
      // |U_|√_|√_|√_|__|
      // |√_|√_|√_|__|__|
      // |√_|√_|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

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
      const unit = new Unit({
        team,
        movement: { steps: 3 },
      })
      const terrain = new Terrain({ cost: () => 3 })
      const graph = createSimpleGraph(5)
      graph[1][1] = new Tile(terrain)
      graph[2][1] = new Tile(terrain)
      const grid = new Grid({ graph }).add.units([[unit, { x: 0, y: 0 }]])

      //  __ __ __ __ __
      // |U_|√_|√_|√_|__|
      // |√_|__|√_|__|__|
      // |√_|__|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

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
      const unit = new Unit({
        team,
        movement: {
          pattern: new RangeConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
          steps: 2,
        },
      })
      const graph = createSimpleGraph(5)
      const grid = new Grid({ graph }).add.units([[unit, { x: 1, y: 1 }]])

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|√_|__|
      // |√_|__|√_|__|__|
      // |__|√_|__|√_|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

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
      const unit = new Unit({
        team,
        movement: {
          pattern: new RangeConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
          steps: 3,
        },
      })
      const terrain = new Terrain({ cost: () => 3 })
      const graph = createSimpleGraph(5)
      graph[1][3] = new Tile(terrain)
      graph[3][1] = new Tile(terrain)
      graph[4][4] = new Tile(terrain)
      const grid = new Grid({ graph }).add.units([[unit, { x: 1, y: 1 }]])

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|__|__|
      // |√_|__|√_|__|√_|
      // |__|__|__|√_|__|
      // |__|__|√_|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

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
    it('can find paths with the default movement pattern', () => {
      const unit = new Unit({ team })
      const terrain = new Terrain({ cost: () => 2 })

      const graph = createSimpleGraph(5)
      graph[1][1] = new Tile(terrain)
      graph[1][2] = new Tile(terrain)
      const grid = new Grid({ graph }).add.unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|__|__|__|__|
      // |√_|t_|t_|__|__|
      // |√_|√_|√_|__|__|
      // |__|__|__|__|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

      const path = pathfinder.get.route({ x: 2, y: 2 })
      const expected = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        path: sortBy(path, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.path).toEqual(sorted.expected)
    })

    it('can find paths with custom movement patterns', () => {
      const unit = new Unit({
        team,
        movement: {
          pattern: new RangeConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
        },
      })
      const terrain = new Terrain({ cost: () => 2 })
      const graph = createSimpleGraph(5)
      graph[1][3] = new Tile(terrain)
      const grid = new Grid({ graph }).add.unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|__|__|__|__|
      // |__|√_|__|t_|__|
      // |__|__|√_|__|√_|
      // |__|__|__|√_|__|
      // |__|__|__|__|__|

      const pathfinder = grid.get.pathfinder(unit)!

      const path = pathfinder.get.route({ x: 4, y: 2 })!
      const expected = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 2 },
      ].map(c => new Coords(c))

      const sorted = {
        expected: sortBy(expected, ['x', 'y']).map(c => c.hash),
        path: sortBy(path, ['x', 'y']).map(c => c.hash),
      }

      expect(sorted.path).toEqual(sorted.expected)
    })
  })
})
