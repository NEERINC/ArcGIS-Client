import { ILayerDefinition } from '@esri/arcgis-rest-feature-service'

interface LayerDefinition extends ILayerDefinition {
  standardMaxRecordCount?: number
  tileMaxRecordCount?: number
}

export default LayerDefinition
