import { ALLEGIANCE_RELATIONSHIP_TYPES } from './constants'

export type AllegianceOpts = {
  hostile?: Allegiance[]
  friendly?: Allegiance[]
  parent?: Allegiance
}

export type AllegianceRelationshipType = ValueInObject<
  typeof ALLEGIANCE_RELATIONSHIP_TYPES
>

export type FactionConfig = {
  branches: number | FactionConfig[]
  parentRelationship?: AllegianceRelationshipType
  siblingRelationship?: AllegianceRelationshipType
}
