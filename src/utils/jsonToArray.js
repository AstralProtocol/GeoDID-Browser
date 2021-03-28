const JsonToArray = (json) => {
  const str = JSON.stringify(json, null, 0);
  const ret = new Uint8Array(str.length);
  // eslint-disable-next-line
  for (let i = 0; i < str.length; i++) {
    ret[i] = str.charCodeAt(i);
  }
  return ret;
};

export default JsonToArray;
