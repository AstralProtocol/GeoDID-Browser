import bs58 from 'bs58';

export default function getBytes32FromCid(cid) {
  return '0x' + bs58.decode(cid).slice(2).toString('hex');
}
