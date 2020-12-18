import AstralClient from '@astraldao/astral-protocol-core';

const loadGeoDid = async (id) => {
  const astral = new AstralClient();

  return astral.loadDocument(id);
};

export default loadGeoDid;
