import web3 from 'web3';

const stringToBytes = (string) => web3.utils.asciiToHex(string);

export default stringToBytes;
