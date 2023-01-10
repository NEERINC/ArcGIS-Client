import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
// @ts-ignore
import tileDecode from 'arcgis-pbf-parser'
import FeatureService from './FeatureService'
import { BBox, Feature } from 'geojson'

const DEFAULT_BBOX: BBox = [-180, -90, 180, 90]

const config: {
  label: string
  url: string
  identityManager?: ArcGISIdentityManager,
  bbox?: BBox
}[] = [
    //{ label: 'Lawrence', url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer' },
    { label: 'JoCo', url: 'https://maps.jocogov.org/arcgis/rest/services/JCW_GBA/FeatureServer', bbox: [-94.751, 38.999, -94.749, 39.001] }
  ]

describe('FeatureService', () => {
  for (let i = 0; i < config.length; i++) {
    const { label, url, identityManager } = config[i]
    const bbox = config[i].bbox || DEFAULT_BBOX

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
              const vector = await service.getVector(layer, bbox, {
                outSR: '4326',
                tolerance: 1
              })
              expect(vector).toBeDefined()
              expect(Buffer.isBuffer(vector))
              const { featureCollection } = tileDecode(vector)
              for (let i = 0; i < featureCollection.features.length; i++) {
                const feature = featureCollection.features[i] as Feature
                expect(feature).toBeDefined()
                expect(feature.type).toBe('Feature')
                if (feature.geometry != null) {
                  expect(feature.geometry.type).toBeDefined()
                  expect(feature.properties).toBeDefined()
                  switch (feature.geometry.type) {
                    case 'Point':
                      expect(feature.geometry.coordinates[0]).toBeGreaterThanOrEqual(bbox[0])
                      expect(feature.geometry.coordinates[0]).toBeLessThanOrEqual(bbox[2])
                      expect(feature.geometry.coordinates[1]).toBeGreaterThanOrEqual(bbox[1])
                      expect(feature.geometry.coordinates[1]).toBeLessThanOrEqual(bbox[3])
                      break
                    case 'LineString':
                      feature.geometry.coordinates.forEach(point => {
                        expect(point[0]).toBeGreaterThanOrEqual(bbox[0])
                        expect(point[0]).toBeLessThanOrEqual(bbox[2])
                        expect(point[1]).toBeGreaterThanOrEqual(bbox[1])
                        expect(point[1]).toBeLessThanOrEqual(bbox[3])
                      })
                      break
                    case 'Polygon':
                      feature.geometry.coordinates.forEach(lineString => {
                        lineString.forEach(point => {
                          expect(point[0]).toBeGreaterThanOrEqual(bbox[0])
                          expect(point[0]).toBeLessThanOrEqual(bbox[2])
                          expect(point[1]).toBeGreaterThanOrEqual(bbox[1])
                          expect(point[1]).toBeLessThanOrEqual(bbox[3])
                        })
                      })
                      break
                    case 'MultiPolygon':
                      feature.geometry.coordinates.forEach(polygon => {
                        polygon.forEach(lineString => {
                          lineString.forEach(point => {
                            expect(point[0]).toBeGreaterThanOrEqual(bbox[0])
                            expect(point[0]).toBeLessThanOrEqual(bbox[2])
                            expect(point[1]).toBeGreaterThanOrEqual(bbox[1])
                            expect(point[1]).toBeLessThanOrEqual(bbox[3])
                          })
                        })
                      })
                    default:
                      console.log(feature.geometry.type)
                  }
                }
              }
            }
          }))
        }
      })
    })
  }
})
