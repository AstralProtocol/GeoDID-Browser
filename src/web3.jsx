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
} from 'core/newhooks';
import Transactor from 'utils/Transactor';
import { formatEther } from '@ethersproject/units';
// import Hints from "./Hints";
import { INFURA_ID, NETWORK } from 'utils/constants';

const WalletContext = React.createContext();

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORK('ropsten'); // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

// 🛰 providers
if (DEBUG) console.log('📡 Connecting to Mainnet Ethereum');
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
if (DEBUG) console.log('🏠 Connecting to provider:', localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

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
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log('👩‍💼 selected address:', address);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  if (DEBUG) console.log('🏠 localChainId', localChainId);

  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  if (DEBUG) console.log('🕵🏻‍♂️ selectedChainId:', selectedChainId);

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  // const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if (DEBUG)
    console.log('💵 yourLocalBalance', yourLocalBalance ? formatEther(yourLocalBalance) : '...');

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if (DEBUG)
    console.log(
      '💵 yourMainnetBalance',
      yourMainnetBalance ? formatEther(yourMainnetBalance) : '...',
    );

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  if (DEBUG) console.log('📝 readContracts', readContracts);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  if (DEBUG) console.log('🔐 writeContracts', writeContracts);

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
  const uri = useContractReader(readContracts, 'SpatialAssets', 'uri');
  console.log('🤗 uri:', uri);

  // 📟 Listen for broadcast events
  const spatialAssetRegisteredEvents = useEventListener(
    readContracts,
    'SpatialAssets',
    'SpatialAssetRegistered',
    localProvider,
    1,
  );
  console.log('📟 SpatialAssetRegistered events:', spatialAssetRegisteredEvents);

  /*
    const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
    console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
    */

  /*
  let networkDisplay = '';
  if (localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16 }}>
        <Alert
          message={'⚠️ Wrong Network'}
          description={
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{' '}
              <b>{NETWORK(localChainId).name}</b>.
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div
        style={{
          zIndex: 2,
          position: 'absolute',
          right: 154,
          top: 28,
          padding: 16,
          color: targetNetwork.color,
        }}
      >
        {targetNetwork.name}
      </div>
    );
  }
 */
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
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
      localProvider,
      yourLocalBalance,
      price,
      tx,
      writeContracts,
      readContracts,
      web3Modal,
      loadWeb3Modal,
      logoutOfWeb3Modal,
      blockExplorer,
    }),
    [
      address,
      userProvider,
      mainnetProvider,
      localProvider,
      yourLocalBalance,
      price,
      tx,
      writeContracts,
      readContracts,
      web3Modal,
      loadWeb3Modal,
      logoutOfWeb3Modal,
      blockExplorer,
    ],
  );

  /*
    let faucetHint = ""
    const [ faucetClicked, setFaucetClicked ] = useState( false );
      if(!faucetClicked&&localProvider&&localProvider._network&&localProvider._network.chainId==31337&&yourLocalBalance&&formatEther(yourLocalBalance)<=0){
      faucetHint = (
        <div style={{padding:16}}>
          <Button type={"primary"} onClick={()=>{
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true)
          }}>
            💰 Grab funds from the faucet ⛽️
          </Button>
        </div>
      )
  */

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

/*
export function WalletProvider({ children }) {
  return (
    <UseWalletProvider
      chainId={network.chainId}
      connectors={{
        fortmatic: { apiKey: getFortmaticApiKey() },
        portis: { dAppId: getPortisDappId() },
        provided: { provider: window.cleanEthereum },
      }}
    >
      <WalletContextProvider>{children}</WalletContextProvider>
    </UseWalletProvider>
  )
}
WalletProvider.propTypes = { children: PropTypes.node }
*/

export function useWallet() {
  return useContext(WalletContext);
}
