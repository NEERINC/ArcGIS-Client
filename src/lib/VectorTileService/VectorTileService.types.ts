export interface VectorTileServiceStyles {
  version?: number
  sprite?: string
  glyphs?: string
  sources?: {
    esri?: {
      type: 'vector' | string
      bounds?: number[]
      minzoom?: number
      maxzoom?: number
      scheme?: 'tms' | 'xyz'
      url?: string
    }
  }
  layers?: {
    id?: string
    type?: string
    source?: string
    ['source-layer']?: string
    layout?: any
    paint?: any
    minzoom?: number
    maxzoom?: number
  }[]
}
