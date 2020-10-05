import Grid from './entities/Grid'
import Team from './entities/Team'
import Unit from './entities/Unit'
import { create_simple_tileset } from './utils'
import Tile from './entities/Tile'

const team_a = new Team({})
const unit_a = new Unit({ team: team_a, movement: { steps: 8 } })

const grid = new Grid({
  tiles: create_simple_tileset(10),
  units: [[unit_a, { x: 0, y: 0 }]],
})

const deployment = unit_a.deployment!

console.log(deployment.coordinates.raw)

const path = deployment.get_route({ to: { x: 4, y: 4 } })
console.log(path)
deployment.move(path)

console.log(deployment.coordinates.raw)
