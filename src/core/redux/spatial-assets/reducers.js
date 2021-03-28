import { actions } from './actions';

const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

const initialState = {
  geoDIDID: null,
  fileList: [],
  spatialAsset: null,
  spatialAssetLoaded: false,
  children: [],
  parent: null,
  fetchingSpatialAsset: false,
  fetchedSpatialAsset: false,
  docRes: null,
};

export default function spatialAssetsReducer(state = initialState, action) {
  let reduced;
  switch (action.type) {
    case actions.SET_SELECTED_GEODID:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_SELECTED_CHILDREN_CREATION:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_SELECTED_PARENT_CREATION:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_FILELIST:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_SPATIAL_ASSET:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.FETCHING_SPATIAL_ASSET:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.FETCHED_SPATIAL_ASSET:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    // unused
    case actions.COGS_LOADED:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.UNLOAD_COGS:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SET_SELECTED_COG:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case LOCATION_CHANGE:
      reduced = {
        ...initialState,
        geoDIDID: state.geoDIDID,
      };
      break;

    case actions.REGISTERING_SPATIAL_ASSET:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.SPATIAL_ASSET_REGISTERED:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.CLEAN_REGISTRATION_STATUS:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.ENABLING_STORAGE:
      reduced = {
        ...state,
        ...action.payload,
      };
      break;

    case actions.STORAGE_ENABLED:
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
