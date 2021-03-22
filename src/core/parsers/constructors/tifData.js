import { IMAGE_OVERLAY } from 'utils/constants';
import GeoData from './base';

export default class TifData extends GeoData {
  constructor(imageUrl, bounds, zoom, center) {
    super(zoom, center);
    this.imageUrl = imageUrl;
    this.bounds = bounds;
    this.type = IMAGE_OVERLAY;
  }
}
