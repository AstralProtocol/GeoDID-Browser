/* eslint-disable no-underscore-dangle */
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { SUBGRAPH_ENDPOINT } from 'utils/constants';
import { useWallet } from 'core/hooks/web3';
import { AstralClient } from '@astralprotocol/core';

const AstralContext = React.createContext();

export function AstralContextProvider({ children }) {
  const { address, tokenId, setTokenId } = useWallet();
  const [astralInstance, setAstralInstance] = useState();
  const [astralLoaded, setAstralLoaded] = useState(false);

  useEffect(() => {
    const loadAstral = async () => {
      if (address && !astralLoaded && !tokenId) {
        try {
          const newAstral = await AstralClient.build(address, SUBGRAPH_ENDPOINT);

          setTokenId(newAstral._token);
          setAstralInstance(newAstral);
          setAstralLoaded(true);
        } catch {
          console.log('Error loading astral');
        }
      } else if (address && !astralLoaded && tokenId) {
        try {
          const newAstral = await AstralClient.build(address, SUBGRAPH_ENDPOINT, tokenId);
          setAstralInstance(newAstral);
          setAstralLoaded(true);
        } catch {
          console.log('Error loading astral');
        }
      }
    };

    loadAstral();
  }, [address, astralLoaded]);

  const astral = useMemo(
    () => ({
      astralInstance,
      astralLoaded,
    }),
    [astralInstance, astralLoaded],
  );

  return <AstralContext.Provider value={astral}>{children}</AstralContext.Provider>;
}

export function useAstral() {
  return useContext(AstralContext);
}
