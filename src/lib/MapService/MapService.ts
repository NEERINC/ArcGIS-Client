import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { BBox } from 'geojson'
import { ServerType } from '../../types'
import Service from '../Service'
import { MapServiceOptions } from './MapService.types'

class MapService extends Service<ServerType.MapServer> {
  constructor(url: string, identityManager?: ArcGISIdentityManager) {
    super(ServerType.MapServer, url, identityManager)
  }

  public static async load(url: string, identityManager?: ArcGISIdentityManager | undefined) {
    return new MapService(url, identityManager)
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
