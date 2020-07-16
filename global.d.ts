type ValueInObject<T extends {}> = T[keyof T]

type ValueInArray<T extends any[] | ReadonlyArray<any>> = T[number]

type Unit = import('./src/entities/Unit').default
type Grid = import('./src/entities/Grid').default
type Game = import('./src/entities/Game').default
type Terrain = import('./src/entities/Terrain').default
type Tile = import('./src/entities/Tile').default
type Allegiance = import('./src/entities/Allegiance').default

type Coords = import('./src/services/Coords').default
type GridManager = import('./src/services/GridManager').default
type BattleManager = import('./src/services/BattleManager').default

type RawCoords = { x: Coords['x']; y: Coords['y'] }

type GridManagedUnit = {
  unit: Unit
  coordinates: Coords
}
