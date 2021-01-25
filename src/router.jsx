import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
// import loadable from '@loadable/component';
import MainLayout from 'layouts';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import Main from 'pages/Main';
import Map from 'pages/Map';

const routes = [
  {
    path: '/main',
    name: 'Main',
    component: <Main />,
    exact: true,
  },
  {
    path: '/map',
    name: 'Map',
    component: <Map />,
    exact: true,
  },
];

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: '100vh',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function Router() {
  const classes = useStyles();

  return (
    <MainLayout>
      <Route
        path="/"
        render={({ location }) => (
          <div className={classes.root}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              aria-label="Vertical tabs example"
              className={classes.tabs}
              value={location.pathname}
            >
              {routes.map((route, i) => (
                <Tab
                  key={route.path}
                  value={route.path}
                  component={Link}
                  to={route.path}
                  label={route.name}
                  {...a11yProps(i)}
                />
              ))}
            </Tabs>
            <Switch>
              <Route path="/main" render={() => <Main />} key="/main" />
              <Route path="/map" render={() => <Map />} key="/map" />
            </Switch>
          </div>
        )}
      />
    </MainLayout>
  );
}

export default Router;
