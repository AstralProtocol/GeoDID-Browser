/* eslint-disable no-underscore-dangle */
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { SUBGRAPH_ENDPOINT } from 'utils/constants';
import { useWallet } from 'core/hooks/web3';
import { AstralClient } from '@astralprotocol/core';
import { useSnackbar } from 'notistack';

const AstralContext = React.createContext();

export function AstralContextProvider({ children }) {
  const { address, tokenId, setTokenId } = useWallet();
  const [astralInstance, setAstralInstance] = useState();
  const [astralLoaded, setAstralLoaded] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadAstral = async () => {
      console.log(tokenId);
      if (address && !astralLoaded && !tokenId) {
        try {
          const newAstral = await AstralClient.build(address, SUBGRAPH_ENDPOINT);

          setTokenId(newAstral._token);
          setAstralInstance(newAstral);
          setAstralLoaded(true);
          enqueueSnackbar(`Please save the Astral token that was created for you in 'Account'`, {
            variant: 'info',
          });
        } catch (e) {
          console.log('Error loading astral');
          console.log(e);
        }
      } else if (address && !astralLoaded && tokenId) {
        try {
          const newAstral = await AstralClient.build(address, SUBGRAPH_ENDPOINT, tokenId);
          setAstralInstance(newAstral);
          setAstralLoaded(true);
        } catch (e) {
          console.log('Error loading astral');
          console.log(e);
        }
      }
    };

    loadAstral();
  }, [address, astralLoaded]);

  console.log(astralInstance);
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
