import sortBy from 'lodash/sortBy'
import { create_simple_tileset } from '../../utils'
import Team from '../Team'
import {
  SIMPLE_DIAGONAL_CONSTRAINT,
  SIMPLE_ORTHOGONAL_CONSTRAINT,
} from '../../recipes/constraints'
import Unit from '../Unit'
import Grid from '../Grid'
import Tile from '../Tile'
import Coords from '../../services/Coords'
import DeltaConstraint from '../../services/DeltaConstraint'

describe('Deployment', () => {
  const team = new Team()

  describe('getting reachable coordinates', () => {
    it('can get reachable coordinates with default movement constraints and default tile costs', () => {
      const unit = new Unit({
        team,
        movement: {
          steps: 3,
          constraint: new DeltaConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
        },
      })
      const grid = new Grid({
        tiles: create_simple_tileset(5),
      })
      grid.deploy_unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|√_|√_|√_|__|
      // |√_|√_|√_|__|__|
      // |√_|√_|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const deployment = unit.deployment!

      const reachable = deployment.reachable_coords().map(c => new Coords(c))
      const expected = [
        { x: 0, y: 0 },
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

    it('can get reachable coordinates with default movement constraints and custom tile costs', () => {
      const unit = new Unit({
        team,
        movement: { steps: 3 },
      })
      const tiles = create_simple_tileset(5)
      tiles[1][1] = new Tile({ cost: () => 3 })
      tiles[2][1] = new Tile({ cost: () => 3 })
      const grid = new Grid({ tiles })
      grid.deploy_unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|√_|√_|√_|__|
      // |√_|__|√_|__|__|
      // |√_|__|__|__|__|
      // |√_|__|__|__|__|
      // |__|__|__|__|__|

      const deployment = unit.deployment!

      const reachable = deployment.reachable_coords().map(c => new Coords(c))
      const expected = [
        { x: 0, y: 0 },
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

    it('can get reachable coordinates with custom movement constraints and default tile costs', () => {
      const unit = new Unit({
        team,
        movement: {
          constraint: new DeltaConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
          steps: 2,
        },
      })
      const tiles = create_simple_tileset(5)
      const grid = new Grid({ tiles })
      grid.deploy_unit(unit, { x: 1, y: 1 })

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|√_|__|
      // |√_|__|√_|__|__|
      // |__|√_|__|√_|__|
      // |__|__|__|__|__|

      const deployment = unit.deployment!

      const reachable = deployment.reachable_coords().map(c => new Coords(c))
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 1 },
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

    it('can get reachable coordinates with custom movement constraints and custom tile costs', () => {
      const unit = new Unit({
        team,
        movement: {
          constraint: new DeltaConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
          steps: 3,
        },
      })
      const tile = new Tile({ cost: () => 3 })
      const tiles = create_simple_tileset(5)
      tiles[1][3] = tile
      tiles[3][1] = tile
      tiles[4][4] = tile
      const grid = new Grid({ tiles })
      grid.deploy_unit(unit, { x: 1, y: 1 })

      //  __ __ __ __ __
      // |√_|__|√_|__|__|
      // |__|U_|__|__|__|
      // |√_|__|√_|__|√_|
      // |__|__|__|√_|__|
      // |__|__|√_|__|__|

      const deployment = unit.deployment!

      const reachable = deployment.reachable_coords().map(c => new Coords(c))
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: 1, y: 1 },
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
    it('can find paths with the default movement range', () => {
      const unit = new Unit({ team })
      const tile = new Tile({ cost: () => 2 })

      const tiles = create_simple_tileset(5)
      tiles[1][1] = tile
      tiles[1][2] = tile
      const grid = new Grid({ tiles })
      grid.deploy_unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|__|__|__|__|
      // |√_|t_|t_|__|__|
      // |√_|√_|√_|__|__|
      // |__|__|__|__|__|
      // |__|__|__|__|__|

      const deployment = unit.deployment!

      const path = deployment
        .get_route({ to: { x: 2, y: 2 } })
        .map(c => new Coords(c))
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

    it('can find paths with custom movement ranges', () => {
      const unit = new Unit({
        team,
        movement: {
          constraint: new DeltaConstraint(SIMPLE_DIAGONAL_CONSTRAINT),
        },
      })
      const tile = new Tile({ cost: () => 2 })
      const tiles = create_simple_tileset(5)
      tiles[1][3] = tile
      const grid = new Grid({ tiles })
      grid.deploy_unit(unit, { x: 0, y: 0 })

      //  __ __ __ __ __
      // |U_|__|__|__|__|
      // |__|√_|__|t_|__|
      // |__|__|√_|__|√_|
      // |__|__|__|√_|__|
      // |__|__|__|__|__|

      const deployment = unit.deployment!

      const path = deployment
        .get_route({ to: { x: 4, y: 2 } })
        .map(c => new Coords(c))
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
