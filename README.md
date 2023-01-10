# ArcGIS-Client

JavaScript client for connecting and receiving data from ArcGIS servers




## Usage

Install the package into your application

```sh
npm install --save arcgis-client
```

### FeatureService

```ts
import { FeatureService } from 'arcgis-client'

async function main() {
  // Load the service
  const featureService = await FeatureService.load('https://gis2.lawrenceks.org/arcgis/rest/services/PublicWorks/StormSewer/FeatureServer')

  // Go through each layer
  await Promise.all(featureService.layers.map(async layer => {
    // Get all object IDs
    const objectIds = await service.getObjectIds(layer)

    // Get features (results can differ based on provided options object)
    const features = await service.getFeatures(layer, /*options*/)

    // Get vector file at tile [0, 0, 0]
    const vector = await service.getVector(layer, 0, 0, 0)
  }))
}
```

