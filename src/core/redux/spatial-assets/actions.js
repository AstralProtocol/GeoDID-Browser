export const actions = {
  SET_SELECTED_GEODID: 'spatial-assets/SET_SELECTED_GEODID',
  SET_FILELIST: 'spatial-assets/SET_FILELIST',
  SET_SPATIAL_ASSET: 'spatial-assets/SET_SPATIAL_ASSET',
  SET_SELECTED_CHILDREN_CREATION: 'spatial-assets/SET_SELECTED_CHILDREN_CREATION',
  SET_SELECTED_PARENT_CREATION: 'spatial-assets/SET_SELECTED_PARENT_CREATION',
  FETCH_SPATIAL_ASSET: 'spatial-assets/FETCH_SPATIAL_ASSET',
  FETCHING_SPATIAL_ASSET: 'spatial-assets/FETCHING_SPATIAL_ASSET',
  FETCHED_SPATIAL_ASSET: 'spatial-assets/FETCHED_SPATIAL_ASSET',

  // unused for now
  LOAD_COGS: 'spatial-assets/LOAD_COGS',
  UNLOAD_COGS: 'spatial-assets/UNLOAD_COGS',
  COGS_LOADED: 'spatial-assets/COGS-LOADED',
  SET_SELECTED_COG: 'spatial-assets/SET_SELECTED_COG',
  REGISTER_SPATIAL_ASSET: 'spatial-assets/REGISTER_SPATIAL_ASSET',
  REGISTERING_SPATIAL_ASSET: 'spatial-assets/REGISTERING_SPATIAL_ASSET',
  SPATIAL_ASSET_REGISTERED: 'spatial-assets/SPATIAL_ASSET_REGISTERED',
  STOP_CHANNEL_FORK: 'spatial-assets/STOP_CHANNEL_FORK',
  CLEAN_REGISTRATION_STATUS: 'spatial-assets/REGISTRATION_CLEANED',
  ENABLE_STORAGE: 'spatial-assets/ENABLE_STORAGE',
  ENABLING_STORAGE: 'spatial-assets/ENABLING_STORAGE',
  STORAGE_ENABLED: 'spatial-assets/STORAGE_ENABLED',
};

export const fetchSpatialAsset = (astral, geoDIDID, tokenId) => ({
  type: actions.FETCH_SPATIAL_ASSET,
  payload: {
    astral,
    geoDIDID,
    tokenId,
  },
});

export const setSelectedGeoDID = (geoDIDID) => ({
  type: actions.SET_SELECTED_GEODID,
  payload: {
    geoDIDID,
  },
});

export const setSelectedParentCreation = (parent) => ({
  type: actions.SET_SELECTED_PARENT_CREATION,
  payload: {
    parent,
  },
});

export const setSelectedChildrenCreation = (children) => ({
  type: actions.SET_SELECTED_CHILDREN_CREATION,
  payload: {
    children,
  },
});

export const setFileList = (fileList) => ({
  type: actions.SET_FILELIST,
  payload: {
    fileList,
  },
});

export const setSpatialAsset = (spatialAsset, spatialAssetLoaded) => ({
  type: actions.SET_SPATIAL_ASSET,
  payload: {
    spatialAsset,
    spatialAssetLoaded,
  },
});

// Unused for now

export const loadCogs = (loadedCogs) => ({
  type: actions.LOAD_COGS,
  payload: {
    loadedCogs,
  },
});

export const unloadCogs = () => ({
  type: actions.UNLOAD_COGS,
  payload: {
    loadedCogs: null,
    loadedTiffJson: [],
    selectedCog: null,
  },
});

export const setSelectedCog = (selectedCog) => ({
  type: actions.SET_SELECTED_COG,
  payload: {
    selectedCog,
  },
});

export const registerSpatialAsset = () => ({
  type: actions.REGISTER_SPATIAL_ASSET,
});

export const cleanRegistrationStatus = () => ({
  type: actions.CLEAN_REGISTRATION_STATUS,
  payload: {
    spatialAssetRegistered: false,
  },
});

export const enableStorage = (storageSignature) => ({
  type: actions.ENABLE_STORAGE,
  payload: {
    storageSignature,
  },
});
