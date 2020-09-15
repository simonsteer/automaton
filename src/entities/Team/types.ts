import { Team, Unit } from '..'

export interface TeamConfig {
  hostile?: Team[]
  friendly?: Team[]
  neutral?: Team[]
  wildcard?: Team[]
  parent?: Team
}

export type TeamRelationshipType = Exclude<keyof TeamConfig, 'parent'>

/**
 * @type
 * Describes how `Team.split` should create team subdivisions.
 * */
export type TeamSplitConfig =
  | number
  | TeamRelationshipType
  | {
      splits: number | TeamSplitConfig[]
      parentRelationship?: TeamRelationshipType
      siblingRelationship?: TeamRelationshipType
    }
