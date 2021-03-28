export const actions = {
  SET_SELECTED_GEODID: 'spatial-assets/SET_SELECTED_GEODID',
  SET_FILELIST: 'spatial-assets/SET_FILELIST',
  SET_SPATIAL_ASSET: 'spatial-assets/SET_SPATIAL_ASSET',
  SET_SELECTED_CHILDREN_CREATION: 'spatial-assets/SET_SELECTED_CHILDREN_CREATION',
  SET_SELECTED_PARENT_CREATION: 'spatial-assets/SET_SELECTED_PARENT_CREATION',
};

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
