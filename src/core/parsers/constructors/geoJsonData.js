import { GEOJSON_OVERLAY } from 'utils/constants';
import GeoData from './base';

export default class GeoJsonData extends GeoData {
  constructor(data, zoom, center) {
    super(zoom, center);
    this.data = data;
    this.type = GEOJSON_OVERLAY;
  }
}
