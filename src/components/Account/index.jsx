import React from 'react';
import AstralButton from 'components/AstralButton';
import { makeStyles } from '@material-ui/core/styles';
import { useWallet } from '../../web3';
import Address from './Address';
import Balance from './Balance';
import Wallet from './Wallet';

const useStyles = makeStyles((theme) => ({
  // necessary for content to be below app bar
  accountContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    color: theme.palette.primary.white,
    minHeight: '100px',
  },
}));

export default function Account() {
  const {
    address,
    userProvider,
    localProvider,
    mainnetProvider,
    price,
    web3Modal,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    blockExplorer,
  } = useWallet();

  const classes = useStyles();

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <AstralButton key="logoutbutton" click={logoutOfWeb3Modal} title="Logout" />,
      );
    } else {
      modalButtons.push(
        <AstralButton
          key="loginbutton"
          /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
          click={loadWeb3Modal}
          title="Connect"
        />,
      );
    }
  }

  return (
    <div>
      <div className={classes.accountContainer}>
        <div>
          {address ? (
            <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
          ) : (
            'Connecting...'
          )}
        </div>
        <div>
          <Balance address={address} provider={localProvider} dollarMultiplier={price} />
        </div>
        <div>
          <Wallet
            address={address}
            provider={userProvider}
            ensProvider={mainnetProvider}
            price={price}
          />
        </div>
      </div>
      <div>{modalButtons}</div>
    </div>
  );
}
