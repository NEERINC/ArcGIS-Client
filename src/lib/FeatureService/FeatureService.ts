import {
  getLayer,
  getService,
  IFeature,
  IFeatureServiceDefinition,
  ILayerDefinition,
  IQueryFeaturesResponse,
  queryFeatures
} from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import chunk from 'lodash.chunk'
import { ServerType } from '../../types'
import Service from '../Service'
import {
  GetFeaturesOptions,
  LayerDefinition
} from './FeatureService.types'

class FeatureService extends Service<ServerType.FeatureServer> {
  public readonly definition: IFeatureServiceDefinition
  public readonly layers: LayerDefinition[]

  constructor(definition: IFeatureServiceDefinition, layers: LayerDefinition[], url: string, identityManager?: ArcGISIdentityManager) {
    super(ServerType.FeatureServer, url, identityManager)

    this.definition = definition
    this.layers = layers
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
    const definition = await getService({
      url,
      authentication: identityManager
    })

    const layers = await Promise.all(definition.layers.map(layer => layer.id).filter(id => id != null).map(id => getLayer({
      url: `${url}/${id!}`
    })))

    return new FeatureService(definition, layers, url, identityManager)
  }

  /**
   * Query the feature service to return an array of all object IDs given the provided layer
   */
  public async getObjectIds(layer: LayerDefinition): Promise<number[]> {
    if (layer.id == null) throw new Error('Layer ID is null')

    const response = await queryFeatures({
      url: `${this.url}/${layer.id}`,
      returnIdsOnly: true,
      f: 'json',
      authentication: this.identityManager
    }) as { objectIds: number[] }

    return response.objectIds
  }

  /**
   * Query the feature service to return an array of features given the provided layer
   */
  public async getFeatures(layer: LayerDefinition, options?: GetFeaturesOptions): Promise<IFeature[]> {
    if (layer.id == null) throw new Error('Layer ID is null')

    const response = await queryFeatures({
      url: `${this.url}/${layer.id}`,
      authentication: this.identityManager,
      f: 'geojson',
      ...options
    }) as unknown as IQueryFeaturesResponse

    return response.features
  }

  /**
   * Query the feature service to return a vector binary file given the provided layer and tile coordinates
   */
  public async getVector(layer: LayerDefinition, x: number, y: number, z: number): Promise<void> {

  }
}

export default FeatureService
