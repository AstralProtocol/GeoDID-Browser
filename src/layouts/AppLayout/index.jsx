import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Drawer,
  CssBaseline,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  IconButton,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MaterialLink from '@material-ui/core/Link';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import SearchBar from 'material-ui-search-bar';
import { Alert, AlertTitle } from '@material-ui/lab';
import { NETWORK } from 'utils/constants';
import { defaultMenuData, loggedInMenuData } from 'core/services/menu';
import Account from 'components/Account';
import { useWallet } from 'core/hooks/web3';
import FilterModal from 'components/FilterModal';
import { snackbarError, closeSnackbar } from 'core/redux/modals/actions';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  appName: {
    color: theme.palette.primary.white,
  },
  barSpace: {
    minHeight: '64px',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.content.background,
    height: `100vh`,
  },
  divider: {
    background: '#444444',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerBottom: {
    color: theme.palette.primary.white,
    position: 'absolute',
    left: '10px',
    bottom: '20px',
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: theme.palette.sider.background,
  },
  listItem: {
    color: theme.palette.primary.white,
  },
  // necessary for content to be below app bar
  logoContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    textAlign: 'center',
    minHeight: '275px',
    justifyItems: 'center',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    width: '100px',
    height: '100px',
  },
  searchBar: {
    marginBottom: '20px',
    marginRight: '10px',
  },
  goback: {
    position: 'fixed',
    bottom: '10px',
    right: '30px',
    backgroundColor: theme.palette.primary.grey,
    color: theme.palette.primary.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.grey,
    },
  },
  largeIcon: {
    width: 120,
    height: 120,
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" align="center">
      {'Copyright © '}
      <MaterialLink color="inherit" href="https://astral.global/">
        Astral
      </MaterialLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function AppLayout(props) {
  const history = useHistory();
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState('');
  const { address, targetNetworkChainId, selectedChainId, targetNetwork } = useWallet();
  const { children, openError, errorMsg, dispatchSnackbarError, dispatchCloseSnackbar } = props;

  console.log(history.location.pathname);
  const handleSearchRequest = (value) => {
    console.log(value);
    const reg = /^did:geo:([1-9a-km-zA-HJ-NP-Z]{46})$/g;
    if (value.match(reg)) {
      history.push(`/browse/${value}`);
    } else {
      dispatchSnackbarError('Wrong GeoDID format. Please try did:geo:id');
    }
  };

  let menuData;

  if (address) {
    menuData = (
      <List className={classes.list}>
        {loggedInMenuData.map((data, index) => (
          <Link to={data.url} key={data.key}>
            <ListItem className={classes.listItem} button key={data.key}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={data.title} />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  } else {
    menuData = (
      <List className={classes.list}>
        {defaultMenuData.map((data, index) => (
          <Link to={data.url} key={data.key}>
            <ListItem className={classes.listItem} button key={data.key}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={data.title} />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  let networkError = '';
  if (targetNetworkChainId && selectedChainId && targetNetworkChainId !== selectedChainId) {
    networkError = (
      <div
        style={{
          zIndex: 2,
          position: 'absolute',
          right: 0,
          bottom: 60,
          padding: 16,
          width: '30vw',
        }}
      >
        <Alert severity="error">
          <AlertTitle>⚠️ Wrong Network</AlertTitle>
          <Typography variant="h6">
            You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{' '}
            <b>{targetNetwork.name}</b>.{' '}
          </Typography>
        </Alert>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <FilterModal />
      {/*
      <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Permanent drawer
        </Typography>
      </Toolbar>
    </AppBar>
    */}

      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.logoContainer}>
          <img className={classes.logo} src="Transparent-Symbol.png" alt="logo" />
          <Typography className={classes.appName} variant="h6" noWrap>
            Astral Studio
          </Typography>
          <div className={classes.accountArea}>
            <Account />
          </div>
        </div>
        <Divider className={classes.divider} />
        {menuData}
        <div className={classes.drawerBottom}>
          <SearchBar
            className={classes.searchBar}
            placeholder="Search GeoDID"
            value={searchValue}
            onChange={(newValue) => setSearchValue(newValue)}
            onRequestSearch={(newValue) => handleSearchRequest(newValue)}
          />
          <Copyright />
        </div>
      </Drawer>
      <main className={classes.content}>
        {/*
        <div className={classes.barSpace} />
          */}
        {children}
        <div>{networkError}</div>
        {history.location.pathname !== '/Landing' && (
          <IconButton className={classes.goback} onClick={() => history.goBack()}>
            <ArrowBackIcon />
          </IconButton>
        )}
      </main>
      <Snackbar open={openError} autoHideDuration={6000} onClose={dispatchCloseSnackbar}>
        <Alert onClose={dispatchCloseSnackbar} severity="warning">
          <AlertTitle>Warning</AlertTitle>
          {errorMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

const mapStateToProps = (state) => ({
  selectedAccount: state.login.selectedAccount,
  isLoggedIn: state.login.isLoggedIn,
  signingOut: state.login.signingOut,
  openError: state.modals.openError,
  errorMsg: state.modals.errorMsg,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchCloseSnackbar: () => dispatch(closeSnackbar()),
  dispatchSnackbarError: (errorMsg) => dispatch(snackbarError(errorMsg)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppLayout));
