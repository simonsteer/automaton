import Weapon from '../Weapon'
import { EventEmitter } from 'events'

export default class Game {
  private emitter = new EventEmitter()
  defaults: { weapon: Weapon }
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    team: new Map<Symbol, Team>(),
    weapon: new Map<Symbol, Weapon>(),
  } as const

  constructor() {
    this.defaults = {
      weapon: new Weapon(this),
    }
  }
}
