import TifParser from './tifParser';
import GeoJsonParser from './geoJsonParser';

export default function createParser(files: FileList, mapRef: any) {
  if (files[0].name.endsWith('.tif') || files[0].name.endsWith('.tiff')) {
    return new TifParser(files, mapRef);
  } else if (files[0].name.endsWith('.json')) {
    return new GeoJsonParser(files, mapRef);
  }
}
