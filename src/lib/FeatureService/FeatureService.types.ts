import {
  IFeature,
  ILayerDefinition,
  IQueryFeaturesOptions
} from '@esri/arcgis-rest-feature-service'

export type GetFeaturesOptions = Omit<IQueryFeaturesOptions,
  | 'f'
  | 'url'
  | 'authentication'
  | 'quantizationParameters'
  | 'returnIdsOnly'
  | 'returnCountOnly'
  | 'returnExtentOnly'
> & {
  fetchOptions?: RequestInit
}

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
  fetchOptions?: RequestInit
}

export interface LayerDefinition extends ILayerDefinition {
  standardMaxRecordCount?: number
  tileMaxRecordCount?: number
}

export type FeatureCache = Record<string, IFeature[]>
export type VectorCache = Record<string, Buffer>
