import GeoData from './base';
import { IMAGE_OVERLAY } from 'utils/constants';

export default class TifData extends GeoData {
  public imageUrl: string;
  public bounds: any;
  public type = IMAGE_OVERLAY;
  constructor(imageUrl: string, bounds: any, zoom: number, center: any) {
    super(zoom, center);
    this.imageUrl = imageUrl;
    this.bounds = bounds;
  }
}
