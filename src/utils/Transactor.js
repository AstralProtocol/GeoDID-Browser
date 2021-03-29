/* eslint-disable no-param-reassign */
// import { useState } from 'react';
import { hexlify } from '@ethersproject/bytes';
import { parseUnits } from '@ethersproject/units';

import Notify from 'bnc-notify';

const NOTIFY_APY_KEY = process.env.REACT_APP_BNC_NOTIFY_API_KEY;

export default function Transactor(provider, gasPrice, etherscan) {
  if (typeof provider !== 'undefined') {
    // eslint-disable-next-line consistent-return
    return async (tx, enqueueSnackbar, txOptions = {}) => {
      if (txOptions.txState) {
        txOptions.txState.setTxState({
          txSending: true,
          txComplete: false,
        });
      }

      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      console.log('network', network);
      const options = {
        dappId: NOTIFY_APY_KEY, // GET YOUR OWN KEY AT https://account.blocknative.com
        system: 'ethereum',
        networkId: network.chainId,
        darkMode: true, // (default: false)
        transactionHandler: (txInformation) => {
          console.log('HANDLE TX', txInformation);
        },
      };
      const notify = Notify(options);

      let etherscanNetwork = '';
      if (network.name && network.chainId > 1) {
        etherscanNetwork = `${network.name}.`;
      }

      let etherscanTxUrl = `https://${etherscanNetwork}etherscan.io/tx/`;
      if (network.chainId === 100) {
        etherscanTxUrl = 'https://blockscout.com/poa/xdai/tx/';
      }

      try {
        let result;
        if (tx instanceof Promise) {
          console.log('AWAITING TX', tx);
          result = await tx;
        } else {
          if (!tx.gasPrice) {
            tx.gasPrice = gasPrice || parseUnits('4.1', 'gwei');
          }
          if (!tx.gasLimit) {
            tx.gasLimit = hexlify(120000);
          }
          console.log('RUNNING TX', tx);
          result = await signer.sendTransaction(tx);
        }
        console.log('RESULT:', result);
        // console.log("Notify", notify);

        // if it is a valid Notify.js network, use that, if not, just send a default notification
        if ([1, 3, 4, 5, 42, 100].indexOf(network.chainId) >= 0) {
          const { emitter } = notify.hash(result.hash);
          emitter.on('all', (transaction) => ({
            onclick: () => window.open((etherscan || etherscanTxUrl) + transaction.hash),
          }));
          emitter.on('txConfirmed', async () => {
            if (txOptions.addAssets) {
              const addAssetsRes = await txOptions.addAssets.astralInstance.addAssetsToItem(
                txOptions.addAssets.geodidId,
                txOptions.addAssets.data,
              );

              console.log(addAssetsRes);
              await txOptions.addAssets.astralInstance.pinDocument(addAssetsRes);
              const doc = await txOptions.addAssets.astralInstance.loadDocument(
                txOptions.addAssets.geodidId,
              );

              console.log(doc);
            }

            if (txOptions.txState) {
              txOptions.txState.setTxState({
                txSending: false,
                txComplete: true,
              });
            }

            if (txOptions.dispatchSetSelectedParentCreation) {
              txOptions.dispatchSetSelectedParentCreation(null);
            }
            if (txOptions.dispatchSetSelectedChildrenCreation) {
              txOptions.dispatchSetSelectedChildrenCreation([]);
            }
          });
        } else {
          enqueueSnackbar(`Local transaction sent: ${result.hash}`, {
            variant: 'info',
          });
        }

        return result;
      } catch (e) {
        console.log(e);
        console.log('Transaction Error:', e.message);

        enqueueSnackbar(`Transaction Error`, {
          variant: 'warning',
        });

        if (txOptions.txState) {
          txOptions.txState.setTxState({
            txSending: false,
            txComplete: false,
          });
        }
      }
    };
  }
}
