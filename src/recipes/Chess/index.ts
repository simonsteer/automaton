import { Game, Team, Grid } from '../../entities'
import { Pawn, Rook, Knight, Bishop, King, Queen } from './units'

const chess = new Game()

export const [blackTeam, whiteTeam] = new Team(chess)
  .split({ branches: 2, siblingRelationship: 'hostile' })
  .get.children()

const createPieces = (team: 'black' | 'white') => {
  const pawns = Array(8)
    .fill(0)
    .map(() => new Pawn(chess, team))

  const [rook1, rook2] = Array(2)
    .fill(0)
    .map(() => new Rook(chess, team))

  const [knight1, knight2] = Array(2)
    .fill(0)
    .map(() => new Knight(chess, team))

  const [bishop1, bishop2] = Array(2)
    .fill(0)
    .map(() => new Bishop(chess, team))

  const king = new King(chess, team)
  const queen = new Queen(chess, team)

  return [
    [rook1, knight1, bishop1, king, queen, bishop2, knight2, rook2],
    pawns,
  ]
}

const board = new Grid(chess, {
  graph: Array(8)
    .fill(0)
    .map(() =>
      Array(8)
        .fill(0)
        .map(() => chess.defaults.tile)
    ),
  units: (['white', 'black'] as const).reduce((acc, team) => {
    createPieces(team).forEach((row, y) => {
      acc.push(
        ...row.map((piece, x): [Unit, RawCoords] => {
          const coords =
            team === 'black'
              ? { x, y }
              : {
                  x: board.size.x - 1 - x,
                  y: board.size.y - 1 - y,
                }
          return [piece, coords]
        })
      )
    })
    return acc
  }, [] as [Unit, RawCoords][]),
})
