import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';
import MainLayout from 'layouts';

const routes = [
  {
    path: '/landing',
    name: 'Landing',
    component: loadable(() => import('pages/Landing')),
    exact: true,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: loadable(() => import('pages/Dashboard')),
    exact: true,
  },
  {
    path: '/browse',
    name: 'Browse',
    component: loadable(() => import('pages/Dashboard')),
    exact: true,
  },
  {
    path: '/browse/:geoDIDID',
    name: 'Browse',
    component: loadable(() => import('pages/GeoDIDView')),
    exact: true,
  },
];

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/Landing" />} />
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
