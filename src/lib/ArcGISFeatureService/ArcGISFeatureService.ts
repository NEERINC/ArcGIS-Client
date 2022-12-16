import {
  IFeature,
    IFeatureServiceDefinition,
    ILayerDefinition,
    IQueryFeaturesResponse,
    queryFeatures
} from '@esri/arcgis-rest-feature-service'
import chunk from 'lodash.chunk'
import { ArcGISServerType } from '../../types'
import ArcGISService, {
    ArcGISServiceOptions
} from '../ArcGISService'

const DEFAULT_MAX_RECORD_COUNT = 250

class ArcGISFeatureService extends ArcGISService {
    protected _definition?: IFeatureServiceDefinition
    public get definition() { return this._definition }

    protected _layerDefinitions: Map<number, ILayerDefinition> = new Map()
    public get layerDefinitions() { return this._layerDefinitions }

    constructor(options: ArcGISServiceOptions<ArcGISServerType.FeatureServer>) {
        super(options)
    }

    public async getDefinition(): Promise<IFeatureServiceDefinition> {
        const url = new URL(this.options.url)
        url.searchParams.append('f', 'json')
        if (this.options.token != null) url.searchParams.append('token', this.options.token)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        if (!response.ok) throw new Error(`Received response status ${response.status} ${response.statusText} from ${url.toString()}`)

        const result = await response.json()
        if (result == null) throw new Error(`Received null/undefined result from response body`)
        if (typeof result !== 'object') throw new Error(`Received non-object result from response body`)

        this._definition = result
        return result
    }

    public async getLayerDefinition(id: number): Promise<ILayerDefinition> {
        const url = new URL(`${this.options.url}/${id}`)
        url.searchParams.append('f', 'json')
        if (this.options.token != null) url.searchParams.append('token', this.options.token)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        if (!response.ok) throw new Error(`Received response status ${response.status} ${response.statusText} from ${url.toString()}`)

        const result = await response.json()
        if (result == null) throw new Error(`Received null/undefined result from response body`)
        if (typeof result !== 'object') throw new Error(`Received non-object result from response body`)

        this._layerDefinitions.set(id, result)
        return result
    }

    /**
     * Query the feature service to return an array of all object IDs for the specified layer ID
     * @param id The layer ID
     */
    public async getLayerObjectIds(id: number): Promise<number[]> {
        const response = await queryFeatures({
            url: `${this.options.url}/${id}`,
            returnIdsOnly: true,
            f: 'json',
            authentication: this.options.token
        }) as { objectIds: number[] }

        return response.objectIds
    }

    /**
     *
     * @param id The ID of the layer
     * @param objectIds An optional array of objectIds to query for features, otherwise uses all objectIds
     */
    public async getLayerFeatures(id: number, objectIds?: number[]): Promise<IFeature[]>
    /**
     *
     * @param layerDefinition The definition of the layer
     * @param objectIds An optional array of objectIds to query for features, otherwise uses all objectIds
     */
    public async getLayerFeatures(layerDefinition: ILayerDefinition, objectIds?: number[]): Promise<IFeature[]>
    public async getLayerFeatures(layerDefinitionOrId: ILayerDefinition | number, objectIds?: number[]): Promise<IFeature[]> {
        // Get the layer definition if an ID was provided, otherwise use the provided definition
        let layerDefinition: ILayerDefinition | undefined
        if (typeof layerDefinitionOrId === 'number') {
            layerDefinition = this.layerDefinitions.get(layerDefinitionOrId)
            if (layerDefinition == null) throw new Error(`No layer definition with ID ${layerDefinitionOrId} found. Did you forget to run "getLayerDefinition(${layerDefinitionOrId})?`)
        }
        else layerDefinition = layerDefinitionOrId
        if (layerDefinition.id == null) throw new Error(`Layer definition ID is null or undefined.`)
        const layerId = layerDefinition.id

        // Use provided objectIds from function args, or fetch them
        let _objectIds = objectIds
        if (_objectIds == null) _objectIds = await this.getLayerObjectIds(layerDefinition.id)

        // Chunk the objectIds into arrays of the layer's maxRecordCount (as long as it's less than 250)
        const objectIdsChunks = chunk(
            _objectIds,
            (layerDefinition.maxRecordCount != null && layerDefinition.maxRecordCount <= DEFAULT_MAX_RECORD_COUNT)
                ? layerDefinition.maxRecordCount
                : DEFAULT_MAX_RECORD_COUNT)
        const responses = await Promise.all(objectIdsChunks.map(objectIdsChunk => queryFeatures({
            url: `${this.options.url}/${layerId}`,
            objectIds: objectIdsChunk,
            //outSR,
            f: 'geojson',
            authentication: this.options.token
        }) as unknown as IQueryFeaturesResponse))
        const features = responses.flatMap(response => response.features)

        return features
    }
}

export default ArcGISFeatureService
