import { ArcGISServerType } from '../../types'

export interface ArcGISServiceOptions<TType extends ArcGISServerType = ArcGISServerType> {
    url: string
    token?: string
}
