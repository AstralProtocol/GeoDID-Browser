import * as L from 'leaflet';
import Parser from './base';
import GeoJsonData from './constructors/geoJsonData';

export default class GeoJsonParser extends Parser {
  async createLayer() {
    const geoJsonOverlay = new L.GeoJSON(this.selectedFile.data);
    const geoJsonBounds = geoJsonOverlay.getBounds();
    const zoom = this.map.current.leafletElement.getBoundsZoom(geoJsonBounds);
    const center = geoJsonBounds.getCenter();
    return new GeoJsonData(this.selectedFile.data, zoom, center);
  }
}
