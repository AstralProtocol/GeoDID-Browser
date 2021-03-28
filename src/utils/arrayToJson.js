const binArrayToJson = (binArray) => {
  let str = '';
  // eslint-disable-next-line
  for (let i = 0; i < binArray.length; i++) {
    // eslint-disable-next-line
    str += String.fromCharCode(parseInt(binArray[i]));
  }
  return JSON.parse(str);
};

export default binArrayToJson;
