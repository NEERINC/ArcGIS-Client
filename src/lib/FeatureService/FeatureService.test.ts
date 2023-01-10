import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
import FeatureService from './FeatureService'

const config: {
  label: string
  url: string
  identityManager?: ArcGISIdentityManager
}[] = [
    //{ label: 'Lawrence', url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer' },
    { label: 'JoCo', url: 'https://maps.jocogov.org/arcgis/rest/services/JCW_GBA/FeatureServer' }
  ]

describe('FeatureService', () => {
  for (let i = 0; i < config.length; i++) {
    const { label, url, identityManager } = config[i]

    let service: FeatureService
    describe(label, () => {
      beforeAll(async () => {
        service = await FeatureService.load(url, identityManager)
        expect(service.layers).toBeDefined()
      })

      test.skip('Features', async () => {
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

      test('Vector', async () => {
        if (service.layers.length > 0) {
          await Promise.all(service.layers.map(async layer => {
            if (layer.supportedQueryFormats?.toLowerCase().includes('pbf')) {
              const vector = await service.getVector(layer, 0, 0, 0)
              expect(vector).toBeDefined()
              expect(Buffer.isBuffer(vector))
            }
          }))
        }
      })

      test('Vector URL', async () => {
        if (service.layers.length > 0) {
          service.layers.forEach(layer => {
            if (layer.supportedQueryFormats?.toLowerCase().includes('pbf')) {
              const vectorUrl = service.getVectorUrl(layer, 0, 0, 0)
              expect(vectorUrl).toContain(url)
              expect(vectorUrl).toContain(`/${layer.id}/query`)
              expect(vectorUrl).toContain('f=pbf')
            }
          })
        }
      })
    })
  }
})
