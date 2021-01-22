import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import loadable from '@loadable/component';
import MainLayout from 'layouts';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';

const routes = [
  // Home
  {
    path: '/main',
    component: loadable(() => import('pages/Main')),
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
          <>
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
                  to="/main"
                  label={route.path}
                  {...a11yProps(i)}
                />
              ))}
            </Tabs>
            <Switch>
              {routes.map((route) => (
                <Route path={route.path} render={() => route.component()} key={route.path} />
              ))}
            </Switch>
          </>
        )}
      />
    </MainLayout>
  );
}

export default Router;
