import TifParser from './tifParser';
import GeoJsonParser from './geoJsonParser';

export default function createParser(selectedFile, map) {
  console.log(selectedFile);
  if (selectedFile.type === 'geotiff') {
    return new TifParser(selectedFile, map);
  }
  if (selectedFile.type === 'geojson') {
    return new GeoJsonParser(selectedFile, map);
  }

  return null;
}
