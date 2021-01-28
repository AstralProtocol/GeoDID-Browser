import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import MaterialLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import SearchBar from 'material-ui-search-bar';
import AstralButton from 'components/AstralButton';
import { defaultMenuData, loggedInMenuData } from 'core/services/menu';

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
    alignItems: 'center',
  },
  accountArea: {
    alignItems: 'top',
  },
  barSpace: {
    minHeight: '64px',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.content.background,
    height: `100vh`,
  },
  copyright: {
    color: theme.palette.primary.white,
    position: 'absolute',
    left: '10px',
    bottom: '20px',
  },
  divider: {
    background: '#444444',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
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
    gridTemplateRows: '100px 50px 1fr',
    textAlign: 'center',
    minHeight: '250px',
    justifyItems: 'center',
  },
  logo: {
    alignItems: 'center',
    width: '100px',
    height: '100px',
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
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState('');

  const { children, selectedAccount } = props;

  let menuData = (
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

  if (selectedAccount) {
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
  }
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Permanent drawer
          </Typography>
        </Toolbar>
      </AppBar>
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
            <AstralButton>Connect</AstralButton>
          </div>
        </div>
        <Divider className={classes.divider} />
        {menuData}
        <div className={classes.copyright}>
          <SearchBar
            placeholder="Search GeoDID"
            value={searchValue}
            onChange={(newValue) => setSearchValue(newValue)}
            onRequestSearch={() => console.log(searchValue)}
          />
          <Copyright />
        </div>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.barSpace} />
        {children}
      </main>
    </div>
  );
}

const mapStateToProps = (state) => ({
  selectedAccount: state.login.selectedAccount,
  isLoggedIn: state.login.isLoggedIn,
  signingOut: state.login.signingOut,
});

export default withRouter(connect(mapStateToProps, null)(AppLayout));
