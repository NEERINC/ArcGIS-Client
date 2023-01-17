import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { ServerType } from '../../types'
import Service from '../Service'

class VectorTileService extends Service<ServerType.MapServer> {
  constructor(url: string, identityManager?: ArcGISIdentityManager) {
    super(ServerType.MapServer, url, identityManager)
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
    return new VectorTileService(url, identityManager)
  }
}

export default VectorTileService
