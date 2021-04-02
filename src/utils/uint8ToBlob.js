export default function uint8ToBlob(uint8Array, ext) {
  const arrayBuffer = uint8Array.buffer;
  const blob = new Blob([arrayBuffer]);

  let file;

  if (ext === 'tif') {
    file = new File([blob], 'raster.tif', { type: 'image/tiff' });
  } else if (ext === 'json') {
    file = new File([blob], 'geo.json', { type: 'application/json' });
  }

  return file;
}
