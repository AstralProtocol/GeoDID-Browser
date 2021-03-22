import { fromBlob } from 'geotiff';
import Parser from './base';
import 'leaflet-geotiff-2';

export default class TifParser extends Parser {
  async createLayer() {
    console.log(this.files[0]);

    const options = {
      renderer: null,
      bounds: [],
      band: 0,
      image: 0,
      clip: undefined,
      pane: 'overlayPane',
      onError: null,
      sourceFunction: fromBlob,
      arrayBuffer: null,
      noDataValue: undefined,
      noDataKey: undefined,
      blockSize: 65536,
      opacity: 1,
    };

    // eslint-disable-next-line
    L.leafletGeotiff(this.files[0], options).addTo(this.mapRef.current.leafletElement);

    return null;
  }
}
