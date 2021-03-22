import TifParser from './tifParser';
import GeoJsonParser from './geoJsonParser';

export default function createParser(files, mapRef) {
  if (files[0].name.endsWith('.tif') || files[0].name.endsWith('.tiff')) {
    return new TifParser(files, mapRef);
  }
  if (files[0].name.endsWith('.json')) {
    return new GeoJsonParser(files, mapRef);
  }

  return null;
}
