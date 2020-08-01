type ValueInObject<T extends {}> = T[keyof T]

type ValueInArray<T extends any[] | ReadonlyArray<any>> = T[number]

type Unit = import('./src/entities/Unit').default
type Grid = import('./src/entities/Grid').default
type Game = import('./src/entities/Game').default
type Terrain = import('./src/entities/Terrain').default
type Tile = import('./src/entities/Tile').default
type Team = import('./src/entities/Team').default
type Weapon = import('./src/entities/Weapon').default

type Coords = import('./src/services/Coords').default
type Pathfinder = import('./src/services/Pathfinder').default
type BattleManager = import('./src/services/BattleManager').default

type RawCoords = { x: Coords['x']; y: Coords['y'] }

type FunctionMap = { [key: string]: (...args: any[]) => any }

type ExtractMapValue<M> = M extends Map<any, infer R> ? R : M
