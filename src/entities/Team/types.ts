export interface TeamConfig {
  hostile?: Team[]
  friendly?: Team[]
  neutral?: Team[]
  wildcard?: Team[]
  parent?: Team
}

export type TeamRelationshipType = Exclude<keyof TeamConfig, 'parent'>

export type TeamSplitConfig =
  | number
  | TeamRelationshipType
  | {
      branches: number | TeamSplitConfig[]
      parentRelationship?: TeamRelationshipType
      siblingRelationship?: TeamRelationshipType
    }
