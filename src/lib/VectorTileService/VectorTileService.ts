import { IFeatureServiceDefinition } from '@esri/arcgis-rest-feature-service'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { ServerType } from '../../types'
import Service from '../Service'
import { VectorTileServiceStyles } from './VectorTileService.types'

class VectorTileService extends Service<ServerType.VectorTileServer> {
  public readonly definition: IFeatureServiceDefinition & { defaultStyles?: string }
  public readonly styles?: VectorTileServiceStyles

  public get tile() { return `${this.url}/tile/{z}/{y}/{x}.pbf` }

  constructor(definition: IFeatureServiceDefinition, styles: VectorTileServiceStyles | undefined, url: string, identityManager?: ArcGISIdentityManager, cache?: boolean) {
    super(ServerType.VectorTileServer, url, identityManager)
    this.definition = definition
    this.styles = styles
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
    const params = new URLSearchParams({
      f: 'json'
    })
    if (identityManager != null) params.append('token', identityManager.token)
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET'
    })
    if (response.ok) {
      const definition = await response.json() as IFeatureServiceDefinition & { defaultStyles?: string }

      let styles: VectorTileServiceStyles | undefined
      if (definition.defaultStyles != null) {
        const stylesResponse = await fetch(`${url}/${definition.defaultStyles}?${params.toString()}`, {
          method: 'GET'
        })
        if (response.ok) styles = await stylesResponse.json()
      }

      return new VectorTileService(definition, styles, url, identityManager)
    }
  }
}

export default VectorTileService
