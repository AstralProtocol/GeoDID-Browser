import AstralClient from '@astralprotocol/core';

const generateGeoDID = async (id, spatialAsset, address) => {
  const astral = new AstralClient();

  return astral.createGeoDID(id, spatialAsset, address);
};

export default generateGeoDID;
