type TileInteractionCallback<D = void> = (unit: Unit) => D

export default class Tile {
  static SIDE_EFFECTS = {
    END_TURN: Symbol(),
    END_ROUTE: Symbol(),
    OBSTRUCT_ROUTE: Symbol(),
  }

  terrain: Terrain
  constructor(terrain: Terrain) {
    this.terrain = terrain
  }

  shouldEndRouteAfterEnter: TileInteractionCallback<boolean> = () => false
  shouldEndRouteBeforeEnter: TileInteractionCallback<boolean> = () => false
  onUnitEnter: TileInteractionCallback<void> = () => {}
  onUnitExit: TileInteractionCallback<void> = () => {}
  onUnitStop: TileInteractionCallback<void> = () => {}
}
