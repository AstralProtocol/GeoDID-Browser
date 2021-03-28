import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import modals from 'core/redux/modals/reducers';
import spatialAssets from 'core/redux/spatial-assets/reducers';

export const history = createBrowserHistory();

const appReducer = combineReducers({
  modals,
  router: connectRouter(history),
  spatialAssets,
});

export default appReducer;
