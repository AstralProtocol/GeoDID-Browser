import React from 'react';
import { Switch, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import MainLayout from 'layouts';
import TabPanel from 'components/LayoutComponents/TabPanel';

const routes = [
  // Home
  {
    path: '/new',
    component: loadable(() => import('pages/New')),
  },
  {
    path: '/main',
    component: loadable(() => import('pages/Main')),
    exact: true,
  },
  /*
  {
    path: '/map',
    component: loadable(() => import('pages/Map')),
  },
  */
];

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route
          path="/"
          render={(history) => (
            <TabPanel
              value={history.location.pathname !== '/' ? history.location.pathname : false}
              routes={routes}
            />
          )}
        />
        {routes.map((route) => (
          <Route path={route.path} component={route.component} key={route.path} />
        ))}
      </Switch>
    </MainLayout>
  );
}

export default Router;
