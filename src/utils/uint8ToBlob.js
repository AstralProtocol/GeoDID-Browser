export default function uint8ToBlob(uint8Array) {
  const arrayBuffer = uint8Array.buffer;
  const blob = new Blob([arrayBuffer]);

  const file = new File([blob], 'tiff');

  return file;
}
