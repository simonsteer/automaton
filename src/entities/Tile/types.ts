export type TileInteractionCallback<D = void> = (unit: Unit) => D

export type TileConfig = Partial<Pick<Tile, 'guard' | 'on'>>
