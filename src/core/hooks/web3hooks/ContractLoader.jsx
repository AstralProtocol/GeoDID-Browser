/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from '@ethersproject/contracts';
import { useState, useEffect } from 'react';
import contractList from 'utils/contracts';

const loadContract = (contract, signer, chainId) => {
  const newContract = new Contract(contract.networks[chainId].address, contract.abi, signer);
  try {
    newContract.bytecode = contract.bytecode;
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

export default function useContractLoader(providerOrSigner) {
  console.log(providerOrSigner);
  const [contracts, setContracts] = useState();
  useEffect(() => {
    async function loadContracts() {
      if (typeof providerOrSigner !== 'undefined') {
        try {
          // we need to check to see if this providerOrSigner has a signer or not
          let signer;
          let accounts;
          if (providerOrSigner && typeof providerOrSigner.listAccounts === 'function') {
            accounts = await providerOrSigner.listAccounts();
          }

          const network = await providerOrSigner.getNetwork();

          if (accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner();
          } else {
            signer = providerOrSigner;
          }

          const newContracts = contractList.reduce((accumulator, contract) => {
            accumulator[contract.contractName] = loadContract(contract, signer, network.chainId);
            return accumulator;
          }, {});
          setContracts(newContracts);
        } catch (e) {
          console.log('ERROR LOADING CONTRACTS!!', e);
        }
      }
    }
    loadContracts();
  }, [providerOrSigner]);
  return contracts;
}
