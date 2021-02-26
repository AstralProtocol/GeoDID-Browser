import React from 'react';
import AstralButton from 'components/AstralButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { NETWORK } from 'utils/constants';
import { capitalizeFirstLetter } from 'utils/capitalizeFirst';
import { useWallet } from 'core/hooks/web3';
import Address from './Address';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: '5px',
  },
  // necessary for content to be below app bar
  accountContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    color: theme.palette.primary.white,
    minWidth: '200px',
  },
  network: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    color: theme.palette.primary.main,
  },
  connectButton: {
    marginTop: '5px',
  },
}));

export default function Account() {
  const {
    address,
    mainnetProvider,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    blockExplorer,
    selectedChainId,
  } = useWallet();

  const classes = useStyles();

  const connectButton = [];
  if (selectedChainId) {
    connectButton.push(
      <AstralButton key="logoutbutton" click={logoutOfWeb3Modal} title="Logout" />,
    );
  } else {
    connectButton.push(
      <AstralButton
        key="loginbutton"
        /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
        click={loadWeb3Modal}
        title="Connect"
      />,
    );
  }

  return (
    <div className={classes.root}>
      {selectedChainId ? (
        <div className={classes.accountContainer}>
          <Typography variant="h6" className={classes.network}>
            <FiberManualRecordIcon style={{ color: '#67fe9c' }} />{' '}
            {capitalizeFirstLetter(NETWORK(selectedChainId).name)}
          </Typography>
          <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
        </div>
      ) : (
        <Typography className={classes.network} variant="h6" noWrap>
          Not connected
        </Typography>
      )}
      <div className={classes.connectButton}>{connectButton}</div>
    </div>
  );
}
