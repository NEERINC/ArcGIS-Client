import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import { BBox } from 'geojson'
import MapService from './MapService'

const DEFAULT_BBOX: BBox = [-180, -90, 180, 90]

const config: {
  label: string
  url: string
  identityManager?: ArcGISIdentityManager,
  bbox?: BBox
}[] = [
    { label: 'Lawrence', url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/MapServer', bbox: [-180, -90, 180, 90] }
  ]

describe('MapService', () => {
  for (let i = 0; i < config.length; i++) {
    const { label, url, identityManager } = config[i]
    const bbox = config[i].bbox || DEFAULT_BBOX

    let service: MapService
    describe(label, () => {
      beforeAll(async () => {
        service = await MapService.load(url, identityManager)
        expect(service.definition).toBeDefined()
        expect(service.layers).toBeDefined()
      })

      test('getExportUrl', () => {
        const exportUrl = service.getExportUrl(bbox)
        expect(exportUrl).toBeDefined()
      })
    })
  }
})
