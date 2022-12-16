import { ArcGISServerType } from '../../types'
import ArcGISFeatureService from '../ArcGISFeatureService'
import ArcGISMapService from '../ArcGISMapService'
import ArcGISService, {
    ArcGISServiceOptions
} from '../ArcGISService'

/**
 * This client allows you to specify the URL of a specific ArcGIS service (FeatureServer, MapServer, etc...).
 *
 * You can then run service-specific methods to retrieve data in several different formats, depending on what the server supports.
 */
class ArcGISClient {
    public readonly type: ArcGISServerType
    public readonly service?: ArcGISService<typeof this.type>

    constructor(type: ArcGISServerType, options: ArcGISServiceOptions<typeof type>) {
        this.type = type
        switch (type) {
            case ArcGISServerType.FeatureServer:
                this.service = new ArcGISFeatureService(options)
                break
            case ArcGISServerType.MapServer:
                this.service = new ArcGISMapService(options)
                break
            default:
                throw new Error()
        }
    }
}

export default ArcGISClient
