const getShortAddress = (address) => `${address.substr(0, 6)} ... ${address.substr(-4)}`;

export default getShortAddress;
