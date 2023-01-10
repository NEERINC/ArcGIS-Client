import {
  getLayer,
  getService,
  IFeature,
  IFeatureServiceDefinition,
  IQueryFeaturesResponse,
  queryFeatures
} from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { tileToBBOX } from '@mapbox/tilebelt'
// @ts-ignore
import tileDecode from 'arcgis-pbf-parser'
import { BBox } from 'geojson'
import { ServerType } from '../../types'
import Service from '../Service'
import {
  GetFeaturesOptions,
  GetVectorOptions,
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
   * @param layer The layer definition
   * @param options Additional options to modify the request
   *
   * @example To retrieve a typically higher count of results in a single request, use `standard` for the result type option
   * ```ts
   * getFeatures(layer, { resultType: 'standard' })
   * ```
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
   * Query the feature service to return a vector binary file given the provided layer and bounding box
   */
  public async getVector(layer: LayerDefinition, bbox: BBox, options?: GetVectorOptions): Promise<Buffer> {
    if (layer.id == null) throw new Error('Layer ID is null')

    const extent = {
      xmin: bbox[0],
      ymin: bbox[1],
      xmax: bbox[2],
      ymax: bbox[3],
      spatialReference: {
        latestWkid: 4326,
        wkid: 4326
      }
    }

    const params = new URLSearchParams({
      f: 'pbf',
      geometry: JSON.stringify(extent),
      where: '1=1',
      inSR: '4326',
      outSR: '4326',
      outFields: '*',
      precision: '8',
      quantizationParameters: JSON.stringify({
        extent,
        tolerance: options?.tolerance || 0.25,
        mode: 'view'
      }),
      resultType: 'tile',
      spatialRel: 'esriSpatialRelIntersects',
      geometryType: 'esriGeometryEnvelope',
      returnZ: 'false',
      returnM: 'false',
      returnExceededLimitFeatures: 'true',
      returnGeometry: 'true'
    })
    if (this.identityManager?.token != null) params.append('token', this.identityManager.token)

    const url = `${this.url}/${layer.id}/query?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET'
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`)

    const arrayBuffer = await response.arrayBuffer()

    return Buffer.from(arrayBuffer)
  }
}

export default FeatureService
