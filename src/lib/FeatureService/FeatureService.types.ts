import { ILayerDefinition, IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-service'
import { ISpatialReference } from '@esri/arcgis-rest-request'

export type GetFeaturesOptions = Omit<IQueryFeaturesOptions,
  | 'url'
  | 'authentication'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
  | 'f'
>

export interface LayerDefinition extends ILayerDefinition {
  standardMaxRecordCount?: number
  tileMaxRecordCount?: number
}
