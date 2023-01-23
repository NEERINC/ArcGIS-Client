import { IFeatureServiceDefinition } from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import {
  LayerDefinition,
  ServerType
} from '../../types'
import Service from '../Service'

class VectorTileService extends Service<ServerType.VectorTileServer> {
  public readonly definition: IFeatureServiceDefinition
  public readonly layers: LayerDefinition[]

  public get tile() { return `${this.url}/tile/{z}/{y}/{x}.pbf` }

  constructor(definition: IFeatureServiceDefinition, layers: LayerDefinition[], url: string, identityManager?: ArcGISIdentityManager, cache?: boolean) {
    super(ServerType.VectorTileServer, url, identityManager)
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

    return new VectorTileService(definition, layers, url, identityManager)
  }
}

export default VectorTileService
