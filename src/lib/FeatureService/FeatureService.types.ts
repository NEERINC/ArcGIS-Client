import { ILayerDefinition, IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-service'

export type GetFeaturesOptions = Omit<IQueryFeaturesOptions,
  | 'f'
  | 'url'
  | 'authentication'
  | 'quantizationParameters'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
>

export type GetVectorOptions = Omit<IQueryFeaturesOptions,
  | 'f'
  | 'url'
  | 'authentication'
  | 'quantizationParameters'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
> & {
  tolerance?: number
}

export interface LayerDefinition extends ILayerDefinition {
  standardMaxRecordCount?: number
  tileMaxRecordCount?: number
}
