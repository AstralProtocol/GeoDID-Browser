import bs58 from 'bs58';

export default function getBytes32FromGeoDIDid(geoDIDid) {
  console.log(geoDIDid.substring(8));

  return '0x' + bs58.decode(geoDIDid.substring(8)).slice(2).toString('hex');
}
