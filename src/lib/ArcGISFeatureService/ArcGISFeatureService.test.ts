import ArcGISFeatureService from './ArcGISFeatureService'

describe('ArcGISFeatureService', () => {
    const featureServices: Record<string, ArcGISFeatureService> = {
        'Lawrence': new ArcGISFeatureService({
            url: 'https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer'
        })
    }

    Object.keys(featureServices).map(name => {
        const featureService = featureServices[name]

        test(name, async () => {
            const definition = await featureService.getDefinition()
            expect(definition.layers.length).toBeGreaterThan(0)

            await Promise.all(definition.layers.filter(layer => layer.id != null).map(async layer => {
                const layerId = layer.id!
                const layerDefinition = await featureService.getLayerDefinition(layerId)

                if (layerDefinition.supportedQueryFormats != null) {
                    const supportedQueryFormats = layerDefinition.supportedQueryFormats?.split(',').map(f => f.trim())
                    expect(supportedQueryFormats).toContain('geoJSON')

                    const objectIds = await featureService.getLayerObjectIds(layerId)
                    expect(objectIds.length).toBeGreaterThan(0)

                    console.log(objectIds)
                }
            }))
        })
    })
})
