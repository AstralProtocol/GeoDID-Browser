import * as L from 'leaflet';
import { readFileAsync } from '../../utils';
import Parser from './base';
import GeoJsonData from './constructors/geoJsonData';

export default class GeoJsonParser extends Parser {
  async createLayer() {
    const data = await readFileAsync(this.files[0], true);
    const geoJsonData = JSON.parse(data);
    const geoJosnOverlay = new L.GeoJSON(geoJsonData);
    const geoJsonBounds = geoJosnOverlay.getBounds();
    const zoom = this.map.getBoundsZoom(geoJsonBounds);
    const center = geoJsonBounds.getCenter();
    return new GeoJsonData(geoJsonData, zoom, center);
  }
}
