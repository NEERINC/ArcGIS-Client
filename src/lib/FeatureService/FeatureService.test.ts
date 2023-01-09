import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import FeatureService from './FeatureService'

const config: {
  label: string
  url: string
  identityManager?: ArcGISIdentityManager
}[] = [
    { label: 'Lawrence', url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer' }
  ]

describe('FeatureService', () => {
  for (let i = 0; i < config.length; i++) {
    const { label, url, identityManager } = config[i]

    let service: FeatureService
    describe(label, () => {
      beforeAll(async () => {
        service = await FeatureService.load(url, identityManager)
      })

      test('Layers', async () => {
        expect(service.layers).toBeDefined()

        if (service.layers.length > 0) {
          await Promise.all(service.layers.map(async layer => {
            const objectIds = await service.getObjectIds(layer)
            const features = await service.getFeatures(layer, {
              outSR: '4326',
              resultType: 'standard'
            })

            expect(objectIds).toBeDefined()
            expect(features).toBeDefined()

            if (layer.standardMaxRecordCount != null) {
              if (objectIds.length > layer.standardMaxRecordCount) {
                expect(features.length).toBe(layer.standardMaxRecordCount)
              } else {
                expect(features.length).toBe(objectIds.length)
              }
            } else {
              expect(features.length).toBe(objectIds.length)
            }
          }))
        }
      })
    })
  }
})
