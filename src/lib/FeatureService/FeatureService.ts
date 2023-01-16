import {
  IFeatureServiceDefinition,
  ILayerDefinition
} from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { BBox, Feature } from 'geojson'
import { ServerType } from '../../types'
import Service from '../Service'
import {
  FeatureCache,
  GetFeaturesOptions,
  GetVectorOptions,
  LayerDefinition,
  VectorCache
} from './FeatureService.types'
import { bboxToTile, tileToQuadkey } from '@mapbox/tilebelt'

class FeatureService extends Service<ServerType.FeatureServer> {
  public readonly definition: IFeatureServiceDefinition
  public readonly layers: LayerDefinition[]

  protected featureCache?: FeatureCache
  protected vectorCache?: VectorCache

  constructor(definition: IFeatureServiceDefinition, layers: LayerDefinition[], url: string, identityManager?: ArcGISIdentityManager, cache?: boolean) {
    super(ServerType.FeatureServer, url, identityManager)

    this.definition = definition
    this.layers = layers

    if (cache === true) {
      this.featureCache = {}
      this.vectorCache = {}
    }
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined, cache?: boolean) {
    const params = new URLSearchParams({
      f: 'json'
    })
    if (identityManager != null) params.append('token', identityManager.token)
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET'
    })
    const definition = await response.json() as IFeatureServiceDefinition

    const layers = await Promise.all(definition.layers.map(layer => layer.id).filter(id => id != null).map(async id => {
      const layerResponse = await fetch(`${url}/${id!}?${params.toString()}`, {
        method: 'GET'
      })
      const layerDefinition = await layerResponse.json()
      return layerDefinition as ILayerDefinition
    }))

    return new FeatureService(definition, layers, url, identityManager, cache)
  }

  /**
   * Query the feature service to return an array of all object IDs given the provided layer
   */
  public async getObjectIds(layer: LayerDefinition, bbox: BBox): Promise<number[]> {
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
      f: 'json',
      geometry: JSON.stringify(extent),
      geometryType: 'esriGeometryEnvelope',
      where: '1=1',
      quantizationParameters: JSON.stringify({
        extent,
        mode: 'view'
      }),
      returnIdsOnly: 'true'
    })
    if (this.identityManager?.token != null) params.append('token', this.identityManager.token)

    const url = `${this.url}/${layer.id}/query?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET'
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`)

    const result = await response.json() as {
      objectIdFieldName: string,
      objectIds: number[] | null
    }
    if (result.objectIds == null) return []

    return result.objectIds
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
  public async getFeatures(layer: LayerDefinition, bbox: BBox, options?: GetFeaturesOptions): Promise<Feature[]> {
    if (layer.id == null) throw new Error('Layer ID is null')

    const tile = bboxToTile(bbox)
    const quadKey = tileToQuadkey(tile)
    if (this.featureCache != null) {
      if (this.featureCache[quadKey] != null) return this.featureCache[quadKey]
    }

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
      f: 'geojson',
      geometry: options?.geometry != null ? JSON.stringify(options.geometry) : JSON.stringify(extent),
      geometryType: options?.geometryType || 'esriGeometryEnvelope',
      geometryPrecision: '8',
      where: options?.where || '1=1',
      inSR: options?.inSR != null ? typeof options.inSR === 'string' ? options.inSR : JSON.stringify(options.inSR) : '4326',
      outSR: options?.outSR != null ? typeof options.outSR === 'string' ? options.outSR : JSON.stringify(options.outSR) : '4326',
      outFields: options?.outFields != null ? options.outFields != '*' ? options.outFields.join(',') : '*' : '*',
      quantizationParameters: JSON.stringify({
        extent,
        mode: 'view'
      }),
      resultType: options?.resultType || 'standard',
      spatialRel: options?.spatialRel || 'esriSpatialRelIntersects',
      returnZ: options?.returnZ === true ? 'true' : 'false',
      returnM: options?.returnM === true ? 'true' : 'false',
      returnExceededLimitFeatures: options?.returnExceededLimitFeatures === false ? 'false' : 'true',
      returnGeometry: options?.returnGeometry === false ? 'false' : 'true'
    })
    if (this.identityManager?.token != null) params.append('token', this.identityManager.token)
    if (options?.objectIds != null) params.append('objectIds', options.objectIds.join(','))

    const url = `${this.url}/${layer.id}/query?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      signal: options?.signal,
      ...options?.fetchOptions
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`)

    const { features } = await response.json()
    if (this.featureCache != null) {
      this.featureCache[quadKey] = features
    }

    return features
  }

  /**
   * Query the feature service to return a vector binary file given the provided layer and bounding box
   */
  public async getVector(layer: LayerDefinition, bbox: BBox, options?: GetVectorOptions): Promise<Buffer> {
    if (layer.id == null) throw new Error('Layer ID is null')

    const tile = bboxToTile(bbox)
    const quadKey = tileToQuadkey(tile)
    if (this.vectorCache != null) {
      if (this.vectorCache[quadKey] != null) return this.vectorCache[quadKey]
    }

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
      geometryType: 'esriGeometryEnvelope',
      geometryPrecision: '8',
      where: '1=1',
      inSR: '4326',
      outSR: '4326',
      outFields: '*',
      quantizationParameters: JSON.stringify({
        extent,
        tolerance: options?.tolerance || 0.0001,
        mode: 'view'
      }),
      resultType: 'tile',
      spatialRel: 'esriSpatialRelIntersects',
      returnZ: 'false',
      returnM: 'false',
      returnExceededLimitFeatures: 'true',
      returnGeometry: 'true'
    })
    if (this.identityManager?.token != null) params.append('token', this.identityManager.token)

    const url = `${this.url}/${layer.id}/query?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      signal: options?.signal,
      ...options?.fetchOptions
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`)

    const vector = Buffer.from(await response.arrayBuffer())
    if (this.vectorCache != null) {
      this.vectorCache[quadKey] = vector
    }

    return vector
  }

  public clearCache() {
    if (this.featureCache != null) {
      delete this.featureCache
      this.featureCache = {}
    }

    if (this.vectorCache != null) {
      delete this.vectorCache
      this.vectorCache = {}
    }
  }
}

export default FeatureService
