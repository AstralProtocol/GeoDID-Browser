import TifParser from './tifParser';
import GeoJsonParser from './geoJsonParser';

export default function createParser(selectedFile, map) {
  console.log(selectedFile);
  if (selectedFile.type === 'GeoTIFF') {
    return new TifParser(selectedFile, map);
  }
  if (selectedFile.type === 'GeoJSON') {
    return new GeoJsonParser(selectedFile, map);
  }

  return null;
}
