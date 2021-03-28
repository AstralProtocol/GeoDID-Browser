import { all, takeEvery, put, call } from 'redux-saga/effects';
import { loadDocument } from '../../services/AstralCore';
import { actions } from './actions';

function* FETCH_SPATIAL_ASSET_SAGA(action) {
  const { payload } = action;

  const { astral, geoDIDID, tokenId } = payload;

  yield put({
    type: actions.FETCHING_SPATIAL_ASSET,
    payload: {
      fetchingSpatialAsset: true,
      fetchedSpatialAsset: false,
    },
  });

  console.log(payload);

  const docRes = yield call(loadDocument, astral, geoDIDID, tokenId);

  if (docRes) {
    yield put({
      type: actions.FETCHED_SPATIAL_ASSET,
      payload: {
        fetchingSpatialAsset: false,
        fetchedSpatialAsset: true,
        docRes,
      },
    });
  }

  // const assetObj = astral.loadAsset(doc, docid, token)
}
export default function* rootSaga() {
  yield all([takeEvery(actions.FETCH_SPATIAL_ASSET, FETCH_SPATIAL_ASSET_SAGA)]);
}
