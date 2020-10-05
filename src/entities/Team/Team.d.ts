import Deployment from '../Deployment'
import Unit from '../Unit'

type TeamRelationshipType = 'friendly' | 'hostile' | 'neutral' | 'wildcard'

type TeamConstructorOptions = {
  parent: Team
  hostile: Team[]
  friendly: Team[]
  neutral: Team[]
  wildcard: Team[]
}

export default class Team {
  constructor(options?: Partial<TeamConstructorOptions>)
  id: string
  parent: Team | undefined
  children: Team[]
  units: Unit[]
  orphan(): Team
  switch_parent(parent: Team): Team
  change_relationship(team: Team, relationship: TeamRelationshipType): Team
  is(team: Team, relationship: TeamRelationshipType): boolean
  deployments(): Deployment[]
  descendants(): Team[]
  progenitor(): Team
  clone(options?: Partial<TeamConstructorOptions>): Team
}
