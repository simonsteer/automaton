import Chess from './Chess'
import ChessTeam from './ChessTeam'

const chess = new Chess()

const renderBoard = () => {
  const pathfinders = chess.board.get.pathfinders()

  return chess.board.graph.reduce((acc, row, y) => {
    const tiles = row.map(({ coords }, x) => {
      const unit = pathfinders.find(p => p.coordinates.hash === coords.hash)
        ?.unit

      let char = (x + y) % 2 ? '░░' : '▓▓'
      if (unit)
        char = char.slice(0, 1) + (unit.team as ChessTeam).type.slice(0, 1)
      return char
    })
    return acc + tiles.join('') + `\n`
  }, '')
}
