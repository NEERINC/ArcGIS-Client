export interface MapServiceOptions {
  format?: 'png' | 'png8' | 'png24' | 'jpg' | 'pdf' | 'bmp' | 'gif' | 'svg' | 'svgz' | 'emf' | 'ps' | 'png32'
  bbSR?: number
  imageSR?: number
  height?: number
  width?: number
  transparent?: boolean
  dpi?: number
}
