import { ArcGISServerType } from '../../types'
import { ArcGISServiceOptions } from './ArcGISService.types'

abstract class ArcGISService<TType extends ArcGISServerType = ArcGISServerType> {
    protected readonly options: ArcGISServiceOptions<TType>

    constructor(options: ArcGISServiceOptions<TType>) {
        this.options = options
    }
}

export default ArcGISService
