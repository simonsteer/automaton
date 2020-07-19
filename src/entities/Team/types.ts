import { TEAM_RELATIONSHIP_TYPES } from './constants'

export type TeamConfig = {
  hostile?: Team[]
  friendly?: Team[]
  parent?: Team
}

export type TeamRelationshipType = ValueInObject<typeof TEAM_RELATIONSHIP_TYPES>

export type TeamSplitConfig =
  | number
  | TeamRelationshipType
  | {
      branches: number | TeamSplitConfig[]
      parentRelationship?: TeamRelationshipType
      siblingRelationship?: TeamRelationshipType
    }
