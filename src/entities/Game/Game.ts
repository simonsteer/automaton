import Weapon from '../Weapon'
import { EventEmitter } from 'events'
import { Terrain } from '..'
import Tile from '../Tile'

export default class Game {
  private emitter = new EventEmitter()
  defaults: { weapon: Weapon; tile: Tile; terrain: Terrain }
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    team: new Map<Symbol, Team>(),
    weapon: new Map<Symbol, Weapon>(),
  } as const

  constructor() {
    const defaultTerrain = new Terrain(this)
    this.defaults = {
      weapon: new Weapon(this),
      terrain: defaultTerrain,
      tile: new Tile(defaultTerrain),
    }
  }

  clear = {
    units: () => this.entities.unit.clear(),
    grids: () => this.entities.grid.clear(),
    terrain: () => this.entities.terrain.clear(),
    teams: () => this.entities.team.clear(),
    weapons: () => this.entities.weapon.clear(),
    entities: () => {
      this.clear.grids()
      this.clear.terrain()
      this.clear.teams()
      this.clear.units()
      this.clear.weapons()
    },
  }
}
