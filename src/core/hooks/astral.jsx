/* eslint-disable no-underscore-dangle */
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { SUBGRAPH_ENDPOINT } from 'utils/constants';
import { useWallet } from 'core/hooks/web3';
import { AstralClient } from '@astralprotocol/core';

const AstralContext = React.createContext();

export function AstralContextProvider({ children }) {
  const { address } = useWallet();
  const [astralInstance, setAstralInstance] = useState();

  useEffect(() => {
    if (address) {
      const newAstral = new AstralClient(address, SUBGRAPH_ENDPOINT);
      setAstralInstance(newAstral);
    }
  }, [address]);

  const astral = useMemo(
    () => ({
      astralInstance,
    }),
    [astralInstance],
  );

  return <AstralContext.Provider value={astral}>{children}</AstralContext.Provider>;
}

export function useAstral() {
  return useContext(AstralContext);
}
