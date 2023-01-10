import { ILayerDefinition, IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-service'

export type GetFeaturesOptions = Omit<IQueryFeaturesOptions,
  | 'url'
  | 'authentication'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
  | 'f'
>

export type GetVectorOptions = Omit<IQueryFeaturesOptions,
  | 'url'
  | 'authentication'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
  | 'f'
> & {
  tolerance?: number
}

export interface LayerDefinition extends ILayerDefinition {
  standardMaxRecordCount?: number
  tileMaxRecordCount?: number
}
