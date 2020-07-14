export default class Base {
  id: Symbol
  game: Game
  constructor(game: Game) {
    this.id = Symbol()
    this.game = game
  }
}
