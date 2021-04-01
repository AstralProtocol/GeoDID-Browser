/* eslint-disable no-underscore-dangle */
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { SUBGRAPH_ENDPOINT } from 'utils/constants';
import { useWallet } from 'core/hooks/web3';
import { AstralClient } from '@astralprotocol/core';
import { useSnackbar } from 'notistack';

const AstralContext = React.createContext();

export function AstralContextProvider({ children }) {
  const { address, astralSpace } = useWallet();
  const [astralInstance, setAstralInstance] = useState();
  const [astralLoaded, setAstralLoaded] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadAstral = async () => {
      if (astralSpace) {
        const tokenId = await astralSpace.private.get('tokenId');

        if (address && !astralLoaded && !tokenId) {
          try {
            const newAstral = await AstralClient.build(
              address,
              SUBGRAPH_ENDPOINT,
              'https://astralinstance.tk',
            );

            await astralSpace.private.set('tokenId', newAstral._token);
            setAstralInstance(newAstral);
            setAstralLoaded(true);

            enqueueSnackbar(`Astral token securely saved on your behalf with 3box`, {
              variant: 'info',
            });
          } catch (e) {
            console.log('Error loading astral');
            console.log(e);
          }
        } else if (address && !astralLoaded && tokenId) {
          try {
            const newAstral = await AstralClient.build(
              address,
              SUBGRAPH_ENDPOINT,
              'https://astralinstance.tk',
              tokenId,
            );
            setAstralInstance(newAstral);
            setAstralLoaded(true);

            enqueueSnackbar(`Astral successfuly loaded, you may interact with the app`, {
              variant: 'success',
            });
          } catch (e) {
            console.log('Error loading astral');
            console.log(e);
          }
        }
      }
    };

    loadAstral();
  }, [address, astralLoaded, astralSpace]);

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
