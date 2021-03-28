export default function blobToUint8(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const uint8ArrayNew = new Uint8Array(reader.result);

      resolve(uint8ArrayNew);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}
