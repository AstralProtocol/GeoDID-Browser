import Web3 from 'web3';

const EthToWei = (n) => new Web3.utils.BN(Web3.utils.toWei(n.toString(), 'ether'));

export default EthToWei;
