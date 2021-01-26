import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';
import MainLayout from 'layouts';

const routes = [
  {
    path: '/browse',
    name: 'Browse',
    component: loadable(() => import('pages/Browse')),
    exact: true,
  },
  {
    path: '/map',
    name: 'Map',
    component: loadable(() => import('pages/Map')),
    exact: true,
  },
];

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/Browse" />} />
        {routes.map((route) => (
          <Route
            path={route.path}
            component={route.component}
            key={route.path}
            exact={route.exact}
          />
        ))}
      </Switch>
    </MainLayout>
  );
}

export default Router;
