export interface GameState {
  units: any[]
  maps: any[]
}

const DEFAULT_GAME_STATE: GameState = {
  units: [],
  maps: [],
}

const loop = function* () {
  const state: GameState = {
    ...DEFAULT_GAME_STATE,
  }

  while (true) {}
}
