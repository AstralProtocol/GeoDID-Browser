import { actions } from './actions';

const initialState = {
  authorized: false,
  end2endLoadingIndicator: false,
  initializingWeb3: false,
  selectedAccount: null,
  provider: null,
  web3: null,
  signingOut: false,
  isLoggedIn: false,
  checkingRoles: false,
  rolesChecked: false,
  hasRole: false,
};

export default function loginReducer(state = initialState, action) {
  let reduced;
  switch (action.type) {
    case actions.CHANGE_AUTHORIZATION:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.INITIALIZING_WEB3:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_WEB3:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.WEB3_ERROR:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SIGNING_OUT:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.CHECKING_ROLES:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.ROLES_CHECKED:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.REGISTRATION_SUCCEEDED:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    default:
      reduced = state;
  }
  return reduced;
}
