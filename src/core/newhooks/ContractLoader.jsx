/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from '@ethersproject/contracts';
import { useState, useEffect } from 'react';
import contractList from 'utils/contracts';

const loadContract = (contract, signer) => {
  const newContract = new Contract(contract.address, contract.abi, signer);
  try {
    newContract.bytecode = contract.bytecode;
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

export default function useContractLoader(providerOrSigner) {
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

          if (accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner();
          } else {
            signer = providerOrSigner;
          }

          const newContracts = contractList.reduce((accumulator, contractName) => {
            accumulator[contractName] = loadContract(contractName, signer);
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
