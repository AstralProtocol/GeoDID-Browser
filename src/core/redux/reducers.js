import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import contracts from 'core/redux/contracts/reducers';
import modals from 'core/redux/modals/reducers';
import login from 'core/redux/login/reducers';
import settings from 'core/redux/settings/reducers';
import spatialAssets from 'core/redux/spatial-assets/reducers';
import { actions } from 'core/redux/login/actions';

export const history = createBrowserHistory();

const appReducer = combineReducers({
  contracts,
  login,
  modals,
  router: connectRouter(history),
  settings,
  spatialAssets,
});

export default (state, action) => {
  if (action.type === actions.LOGIN_SIGNOUT) {
    // preserve menu and settings
    const { settings: sets } = state;
    // eslint-disable-next-line
    state = { settings: sets };
  }
  return appReducer(state, action);
};
