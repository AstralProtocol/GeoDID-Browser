import React from 'react';
import AstralButton from 'components/AstralButton';
import { useWallet } from '../../web3';
import Address from './Address';
import Balance from './Balance';
import Wallet from './Wallet';

export default function Account() {
  const {
    address,
    userProvider,
    localProvider,
    mainnetProvider,
    price,
    minimized,
    web3Modal,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    blockExplorer,
  } = useWallet();

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <AstralButton key="logoutbutton" onClick={logoutOfWeb3Modal}>
          logout
        </AstralButton>,
      );
    } else {
      modalButtons.push(
        <AstralButton
          key="loginbutton"
          /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
          onClick={loadWeb3Modal}
        >
          connect
        </AstralButton>,
      );
    }
  }

  const display = minimized ? (
    ''
  ) : (
    <span>
      {address ? (
        <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      ) : (
        'Connecting...'
      )}
      <Balance address={address} provider={localProvider} dollarMultiplier={price} />
      <Wallet
        address={address}
        provider={userProvider}
        ensProvider={mainnetProvider}
        price={price}
      />
    </span>
  );

  return (
    <div>
      {display}
      {modalButtons}
    </div>
  );
}
