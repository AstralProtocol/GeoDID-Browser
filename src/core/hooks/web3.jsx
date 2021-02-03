/* eslint-disable no-underscore-dangle */
import React, { useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useUserAddress } from 'eth-hooks';
import {
  useExchangePrice,
  useGasPrice,
  useUserProvider,
  useContractLoader,
  useContractReader,
  useEventListener,
  useBalance,
  // useExternalContractLoader,
} from 'core/hooks/web3hooks';
import Transactor from 'utils/Transactor';
import { formatEther } from '@ethersproject/units';
// import Hints from "./Hints";
import { INFURA_ID, targetNetwork } from 'utils/constants';
import { history } from 'core/redux/reducers';

const WalletContext = React.createContext();

// 😬 Sorry for all the console logging
const DEBUG = true;

// 🛰 providers
if (DEBUG) console.log('📡 Connecting to Mainnet Ethereum');
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

/*
// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
if (DEBUG) console.log('🏠 Connecting to provider:', localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);
*/
// 🔭 block explorer URL
const { blockExplorer } = targetNetwork;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

/* eslint-disable no-unused-expressions */
window.ethereum &&
  window.ethereum.on('chainChanged', () => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });
/* eslint-enable no-unused-expressions */

export function WalletContextProvider({ children }) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, 'fast');

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider);
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log('👩‍💼 selected address:', address);

  const targetNetworkChainId = targetNetwork.chainId;

  const selectedChainId = userProvider && parseInt(userProvider.provider.networkVersion, 10);
  if (DEBUG) console.log('🕵🏻‍♂️ selectedChainId:', selectedChainId);

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notifications
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  // const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(userProvider, address);
  if (DEBUG)
    console.log('💵 yourBalance', yourLocalBalance ? formatEther(yourLocalBalance) : '...');

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if (DEBUG)
    console.log('💵 yourBalance', yourMainnetBalance ? formatEther(yourMainnetBalance) : '...');

  /*
  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  if (DEBUG) console.log('📝 readContracts', readContracts);
*/
  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const contracts = useContractLoader(userProvider);
  if (DEBUG) console.log('🔐 writeContracts', contracts);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)
  // console.log("🥇DAI contract on mainnet:",mainnetDAIContract)
  //
  // Then read your DAI balance like:
  // const myMainnetBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])
  //

  // keep track of a variable from the contract in the local React state:
  // pass these below in memo to use in useWallet
  const uri = useContractReader(contracts, 'SpatialAssets', 'uri');
  console.log('🤗 uri:', uri);

  // 📟 Listen for broadcast events
  const spatialAssetRegisteredEvents = useEventListener(
    contracts,
    'SpatialAssets',
    'SpatialAssetRegistered',
    userProvider,
    1,
  );
  console.log('📟 SpatialAssetRegistered events:', spatialAssetRegisteredEvents);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
    history.push('/dashboard');
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const wallet = useMemo(
    () => ({
      address,
      userProvider,
      mainnetProvider,
      yourLocalBalance,
      price,
      tx,
      contracts,
      web3Modal,
      loadWeb3Modal,
      logoutOfWeb3Modal,
      blockExplorer,
      targetNetworkChainId,
      selectedChainId,
      targetNetwork,
    }),
    [
      address,
      userProvider,
      mainnetProvider,
      yourLocalBalance,
      price,
      tx,
      contracts,
      web3Modal,
      loadWeb3Modal,
      logoutOfWeb3Modal,
      blockExplorer,
      targetNetworkChainId,
      selectedChainId,
      targetNetwork,
    ],
  );

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  return useContext(WalletContext);
}
