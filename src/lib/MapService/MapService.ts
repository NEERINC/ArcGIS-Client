import { IFeatureServiceDefinition } from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { BBox } from 'geojson'
import {
  LayerDefinition,
  ServerType
} from '../../types'
import Service from '../Service'
import { MapServiceOptions } from './MapService.types'

class MapService extends Service<ServerType.MapServer> {
  public readonly definition: IFeatureServiceDefinition
  public readonly layers: LayerDefinition[]

  public get tile() { return `${this.url}/tile/{z}/{x}/{y}` }

  constructor(definition: IFeatureServiceDefinition, layers: LayerDefinition[], url: string, identityManager?: ArcGISIdentityManager, cache?: boolean) {
    super(ServerType.MapServer, url, identityManager)
    this.definition = definition
    this.layers = layers
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
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
      return layerDefinition as LayerDefinition
    }))

    return new MapService(definition, layers, url, identityManager)
  }

  public getTileUrl(z: number, x: number, y: number) {
    return `${this.url}/tile/${z}/${x}/${y}`
  }

  public getExportUrl(bbox: BBox, options?: MapServiceOptions) {
    const params = new URLSearchParams({
      f: 'image',
      format: options?.format || 'png',
      bbox: bbox.join(','),
      bbSR: (options?.bbSR || 4326).toString(),
      imageSR: (options?.imageSR || 4326).toString(),
      size: `${options?.width || 400},${options?.height || 400}`,
      transaprent: (options?.transparent || false) === true ? 'true' : 'false',
      dpi: (options?.dpi || 96).toString()
    })
    return `${this.url}/export?${params.toString()}`
  }
}

export default MapService
