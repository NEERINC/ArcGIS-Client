import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { ServerType } from '../../types'
import Service from '../Service'

class MapService extends Service<ServerType.MapServer> {
  constructor(url: string, identityManager?: ArcGISIdentityManager) {
    super(ServerType.MapServer, url, identityManager)
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
    return new MapService(url, identityManager)
  }
}

export default MapService
