import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from 'notistack';
import SearchBar from 'material-ui-search-bar';
import AstralButton from 'components/AstralButton';
import { useWallet } from 'core/hooks/web3';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: '20vh',
    paddingBottom: '4em',
    textAlign: 'center',
  },
  interactionAreaContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat( auto-fit, minmax(250px, 1fr) )`,
    gridGap: '1rem',
    textAlign: 'center',
    justifyItems: 'center',
    alignItems: 'center',
  },
  element1: {
    width: '60%',
    objectFit: 'cover',
  },
}));

export default function Landing() {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [searchValue, setSearchValue] = useState('');

  const { logoutOfWeb3Modal, loadWeb3Modal, selectedChainId } = useWallet();

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

  const handleSearchRequest = (value) => {
    const reg = /^did:geo:([1-9a-km-zA-HJ-NP-Z]{46})$/g;
    if (value.match(reg)) {
      history.push(`/browse/${value}`);
    } else {
      enqueueSnackbar(`Wrong GeoDID format. Please try did:geo:id`, {
        variant: 'warning',
      });
    }
  };

  return (
    <>
      <div className={classes.header}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Enter the Astral Studio
          </Typography>
        </Container>
      </div>
      <div className={classes.interactionAreaContainer}>
        <div className={classes.element1}>
          <Typography variant="h3" component="h1" gutterBottom>
            Read a GeoDID
          </Typography>
          <SearchBar
            placeholder="did:geo"
            value={searchValue}
            onChange={(newValue) => setSearchValue(newValue)}
            onRequestSearch={(newValue) => handleSearchRequest(newValue)}
          />
        </div>
        <div className={classes.element2}>
          <Typography variant="h3" component="h1" gutterBottom>
            Log-in
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            Create / Edit / Delete
          </Typography>
          {connectButton}
        </div>
      </div>
    </>
  );
}
