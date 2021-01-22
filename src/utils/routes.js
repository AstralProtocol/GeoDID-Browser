import loadable from '@loadable/component';

const routes = [
  // Home
  {
    path: '/main',
    component: loadable(() => import('pages/Main')),
    exact: true,
  },
];

export default routes;
