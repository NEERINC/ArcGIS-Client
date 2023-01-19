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
    { label: 'Lawrence', url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer', bbox: [-180, -90, 180, 90] },
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

      test('Features', async () => {
        if (service.layers.length > 0) {
          await Promise.all(service.layers.map(async layer => {
            const objectIds = await service.getObjectIds(layer, bbox)
            const features = await service.getFeatures(layer, bbox)
            const featuresByFirstObjectId = await service.getFeatures(layer, bbox, { objectIds: objectIds.slice(0, 1) })

            expect(objectIds).toBeDefined()
            expect(features).toBeDefined()

            if (objectIds.length > 0 && features.length > 0) {
              expect(featuresByFirstObjectId.length).toBe(1)
            }

            if (layer.standardMaxRecordCount != null) {
              if (objectIds.length > layer.standardMaxRecordCount) {
                expect(features.length).toBeLessThanOrEqual(layer.standardMaxRecordCount)
              } else {
                expect(features.length).toBeLessThanOrEqual(objectIds.length)
              }
            } else {
              expect(features.length).toBeLessThanOrEqual(objectIds.length)
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
                tolerance: 0.0001
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

                  /*
                  switch (feature.geometry.type) {
                    case 'Point':
                      feature.geometry.coordinates.map(coordinate => {
                        expect(countDecimals(coordinate)).toBeLessThanOrEqual(8)
                      })
                      break
                    case 'LineString':
                      feature.geometry.coordinates.forEach(point => {
                        point.forEach(coordinate => {
                          expect(countDecimals(coordinate)).toBeLessThanOrEqual(8)
                        })
                      })
                      break
                    case 'Polygon':
                      feature.geometry.coordinates.forEach(lineString => {
                        lineString.forEach(point => {
                          point.forEach(coordinate => {
                            expect(countDecimals(coordinate)).toBeLessThanOrEqual(8)
                          })
                        })
                      })
                      break
                    case 'MultiPolygon':
                      feature.geometry.coordinates.forEach(polygon => {
                        polygon.forEach(lineString => {
                          lineString.forEach(point => {
                            point.forEach(coordinate => {
                              expect(countDecimals(coordinate)).toBeLessThanOrEqual(8)
                            })
                          })
                        })
                      })
                    default:
                      break
                  }
                  */
                }
              }
            }
          }))
        }
      })

      test('Properties', async () => {
        if (service.layers.length > 0) {
          await Promise.all(service.layers.map(async layer => {
            const properties = await service.getProperties(layer, bbox)
            expect(properties).toBeDefined()
            expect(typeof properties === 'object').toBeTruthy()
            Object.keys(properties).forEach(key => {
              const values = properties[key]
              expect(values.length).toBeGreaterThan(0)
              expect(values.every(value => typeof value[0] === 'number'))
            })
          }))
        }
      })
    })
  }
})

function countDecimals(value: number) {
  if (Math.floor(value.valueOf()) === value.valueOf()) return 0
  return value.toString().split('.')[1].length || 0
}
