import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { ServerType } from '../types'

abstract class Service<TType extends ServerType> {
  public readonly type: TType
  public readonly url: string
  protected identityManager?: ArcGISIdentityManager

  constructor(type: TType, url: string, identityManager?: ArcGISIdentityManager) {
    if (!url.endsWith(`/${type}`)) throw new Error(`Expected ArcGIS feature server URL to end in "/${type}"`)

    this.type = type
    this.url = url
    this.identityManager = identityManager
  }
}

export default Service
