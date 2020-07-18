export default class Base {
  id: Symbol
  game: Game
  constructor(game: Game, entityType: keyof Game['entities']) {
    this.id = Symbol()
    this.game = game
    this.game.entities[entityType].set(
      this.id,
      (this as unknown) as Unit & Grid & Allegiance & Terrain
    )
  }
}
