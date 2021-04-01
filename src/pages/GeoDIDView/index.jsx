import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Backdrop,
  Modal,
  Tooltip,
  LinearProgress,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { useSubscription } from '@apollo/react-hooks';
import geoDIDSubscription from 'core/graphql/geoDIDSubscription';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';
import Map from 'components/Map';
import { useWallet } from 'core/hooks/web3';
import {
  snackbarError,
  toggleAddGeoDIDAsChildrenModal,
  toggleAddGeoDIDAsParentModal,
} from 'core/redux/modals/actions';
import { getBytes32FromGeoDIDid, uint8ToBlob, readFileAsync, jsonToArray } from 'utils';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import ChildrenGeoDIDsTable from 'components/ChildrenGeoDIDsTable';
import ParentGeoDIDsTable from 'components/ParentGeoDIDsTable';
import { useSnackbar } from 'notistack';
import { useAstral } from 'core/hooks/astral';
import AssetsTable from './AssetsTable';

const Fade = React.forwardRef((props, ref) => {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter();
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited();
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  root: {
    height: '100%',
    paddingTop: '10px',
    paddingLeft: '10px',
    paddingBottom: '10px',
    width: '100%',
  },
  divider: {
    width: '1px',
    // height: '184px',
    marginLeft: '20px',
    marginRight: '20px',
    backgroundColor: theme.palette.primary.grey,
  },
  container: {},
  button: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    transform: `translateY(-50%)`,
    background: 'linear-gradient(45deg, #8FB8ED 30%, #62BFED 90%)',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    borderRadius: '20px',
  },
  searchBar: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    transform: `translateY(-50%)`,
  },
  list: {
    borderRadius: '20px',
    height: '100%',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    outline: 0, // Disable browser on-focus borders
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  map: {
    borderRadius: '20px',
  },
  metadata: {
    borderRadius: '20px',
  },
  metadataLoading: {
    textAlign: 'center',
  },
  metadataList: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  scrollbar: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
}));

const GeoDIDView = (props) => {
  const history = useHistory();
  const { tx, contracts } = useWallet();
  const {
    match: { params },
    dispatchSnackbarError,
    dispatchSetSelectedGeoDID,
    dispatchToggleAddGeoDIDAsChildrenModal,
    dispatchToggleAddGeoDIDAsParentModal,
    addChildrenModal,
    addParentModal,
  } = props;
  const { geoDIDID } = params;
  const { enqueueSnackbar } = useSnackbar();
  const { astralInstance } = useAstral();
  const [assetsState, setAssetsState] = useState({
    loading: false,
    loaded: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [doc, setDoc] = useState(null);
  const [assets, setAssets] = useState(null);
  const [file, setFile] = useState(null);
  const classes = useStyles();

  console.log(file);
  const { data: dataSelected, loading: loadingSelected } = useSubscription(geoDIDSubscription, {
    variables: {
      geoDIDID,
    },
  });

  const selectedGeoDID = dataSelected ? dataSelected.geoDID : null;

  const { data, loading } = useSubscription(geoDIDsSubscription, {
    variables: {
      where: {
        ...{ active: true },
      },
    },
  });

  const allAvailableParentsToAdd = data
    ? data.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (
          geoDID.type === 'Collection' &&
          geoDID.id !== geoDIDID &&
          geoDID.parent !== geoDIDID &&
          (!geoDID.parent || geoDID.parent.length === 0)
        ) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const allAvailableChildrenToAdd =
    data && selectedGeoDID
      ? data.geoDIDs.reduce((geoDIDIds, geoDID) => {
          if (
            geoDID.id !== geoDIDID &&
            geoDID.id !== selectedGeoDID.parent &&
            (!geoDID.parent || geoDID.parent.length === 0)
          ) {
            geoDIDIds.push(geoDID);
          }
          return geoDIDIds;
        }, [])
      : [];

  const allAvailableChildrenToRemove = data
    ? data.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (geoDID.id !== geoDIDID && geoDID.parent === geoDIDID) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const handleParentDelete = (parentGeoDID) => {
    if (selectedGeoDID) {
      tx(
        contracts.SpatialAssets.removeParentGeoDID(
          getBytes32FromGeoDIDid(selectedGeoDID.id),
          getBytes32FromGeoDIDid(parentGeoDID),
        ),
        enqueueSnackbar,
      );
    } else {
      dispatchSnackbarError('No selected GeoDID');
    }
  };

  const handleDeletion = () => {
    if (selectedGeoDID) {
      const childrenGeoDIDsAsBytes = selectedGeoDID.edges
        ? selectedGeoDID.edges.reduce((bytes32Ids, edge) => {
            bytes32Ids.push(getBytes32FromGeoDIDid(edge.childGeoDID.id));

            return bytes32Ids;
          }, [])
        : [];

      tx(
        contracts.SpatialAssets.deactivateSpatialAsset(
          getBytes32FromGeoDIDid(selectedGeoDID.id),
          childrenGeoDIDsAsBytes,
        ),
        enqueueSnackbar,
      );
      history.push('/dashboard');
      dispatchSetSelectedGeoDID(null);
    } else {
      dispatchSnackbarError('No selected GeoDID');
    }
  };

  const handleGeoDIDSelection = (value) => {
    dispatchSetSelectedGeoDID(value);
    history.push(`/browse/${value}`);
  };

  useEffect(() => {
    const loadDocument = async () => {
      if (selectedGeoDID && selectedGeoDID.type === 'Item' && astralInstance) {
        try {
          setAssetsState({
            loading: true,
            loaded: false,
          });
          const docRes = await astralInstance.loadDocument(selectedGeoDID.id);

          console.log(docRes);
          if (docRes) {
            setDoc(docRes.documentInfo.documentVal);
            setAssets(docRes.documentInfo.documentVal.service);
          }
          setAssetsState({
            loading: false,
            loaded: true,
          });
        } catch {
          console.log('Not able to load assets for this geodid item');
        }

        // dispatchFetchSpatialAsset(astralInstance, selectedGeoDID.id, tokenId);
      }
    };

    loadDocument();
  }, [selectedGeoDID, astralInstance]);

  useEffect(() => {
    const loadDocument = async () => {
      console.log(doc);
      console.log(selectedAsset);
      if (doc && selectedAsset && astralInstance) {
        try {
          const assetObj = await astralInstance.loadAsset(doc, selectedAsset.id);

          const fileName = selectedAsset.id.split('#')[1];

          const fileExt = fileName.split('.').pop();

          console.log(assetObj.data);
          if (fileExt === 'tif' || fileExt === 'json') {
            const blob = uint8ToBlob(assetObj.data, fileExt);
            if (fileExt === 'tif') {
              setFile({
                tag: blob.name,
                type: 'GeoTIFF',
                size: blob.size,
                data: blob,
                bytes: assetObj.data,
              });
            } else if (fileExt === 'json') {
              const readFile = await readFileAsync(blob, true);
              const geoJsonData = JSON.parse(readFile);
              const jsonBytes = jsonToArray(readFile);
              setFile({
                tag: blob.name,
                type: 'GeoJSON',
                size: blob.size,
                data: geoJsonData,
                bytes: jsonBytes,
              });
            }
            setFile(blob);
          } else {
            console.log('Error fetching file');
          }
          console.log(fileExt);
          console.log(assetObj);
        } catch {
          console.log('Not able to load assets for this geodid item');
        }

        // dispatchFetchSpatialAsset(astralInstance, selectedGeoDID.id, tokenId);
      }
    };

    loadDocument();
  }, [doc, selectedAsset, astralInstance]);

  let geoDIDMetadata;

  if (selectedGeoDID) {
    let assetsArea = '';

    if (selectedGeoDID.type === 'Item') {
      if (assetsState.loading && !assetsState.loaded) {
        assetsArea = (
          <>
            <Typography variant="h5" component="h1" gutterBottom>
              Loading assets
            </Typography>
            <LinearProgress />
          </>
        );
      } else if (!assetsState.loading && assetsState.loaded) {
        assetsArea = (
          <>
            <Typography variant="h5" component="h1" gutterBottom>
              Assets Loaded
            </Typography>
            <AssetsTable
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              assets={assets}
              maxNumberOfRows={3}
            />
          </>
        );
      }
    }

    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '66vh' }}>
          <CardContent style={{ height: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h5" component="h1" gutterBottom>
                  GeoDID Metadata
                </Typography>
                <div style={{ width: '90%' }}>
                  <List className={classes.metadataList}>
                    <ListItem key="geoDIDid" role={undefined} dense>
                      <ListItemText id="geoDIDid" primary="GeoDID" secondary={selectedGeoDID.id} />
                    </ListItem>
                    <ListItem key="cid" role={undefined} dense>
                      <ListItemText id="cid" primary="ContentID" secondary={selectedGeoDID.cid} />
                    </ListItem>
                    <ListItem key="type" role={undefined} dense>
                      <ListItemText id="type" primary="Type" secondary={selectedGeoDID.type} />
                    </ListItem>
                    {selectedGeoDID.parent && selectedGeoDID.parent.length > 0 ? (
                      <ListItem
                        key="parent"
                        role={undefined}
                        onClick={() => handleGeoDIDSelection(selectedGeoDID.parent)}
                        button
                      >
                        <ListItemText
                          id="type"
                          primary="Parent"
                          secondary={selectedGeoDID.parent}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Remove parent" aria-label="add">
                            <IconButton
                              edge="start"
                              aria-label="comments"
                              onClick={() => handleParentDelete(selectedGeoDID.parent)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ) : (
                      <ListItem key="parent" role={undefined} onClick={() => null} button>
                        <ListItemText
                          id="type"
                          primary="Parent"
                          secondary="No Parent - click to add one"
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Add parent" aria-label="add">
                            <IconButton
                              edge="end"
                              aria-label="comments"
                              onClick={() => dispatchToggleAddGeoDIDAsParentModal(true)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </List>
                  <Typography variant="h5" component="h1" gutterBottom display="inline">
                    Quick Actions
                  </Typography>
                  <List component="nav" aria-label="main mailbox folders">
                    <ListItem button onClick={handleDeletion}>
                      <ListItemIcon>
                        <DeleteIcon />
                      </ListItemIcon>
                      <ListItemText primary="Deactivate GeoDID" />
                    </ListItem>
                  </List>
                </div>
              </Grid>
              <Grid item xs={6}>
                {selectedGeoDID.type === 'Collection' && (
                  <>
                    <Typography variant="h5" component="h1" gutterBottom display="block">
                      Children Relationships
                    </Typography>
                    <ChildrenGeoDIDsTable
                      type="Remove"
                      allAvailableChildren={allAvailableChildrenToRemove}
                      loading={loading}
                      maxNumberOfRows={3}
                    />
                    <Typography
                      variant="body2"
                      component="button"
                      gutterBottom
                      display="block"
                      onClick={() => dispatchToggleAddGeoDIDAsChildrenModal(true)}
                    >
                      Click to add more
                    </Typography>
                  </>
                )}
                {assetsArea}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  } else if (!selectedGeoDID && loadingSelected) {
    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '66vh' }}>
          <CardContent style={{ height: '100%', alignItems: 'center', textAlign: 'center' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      </Grid>
    );
  } else {
    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '66vh' }}>
          <CardContent style={{ height: '100%', alignItems: 'center', textAlign: 'center' }} />
        </Card>
      </Grid>
    );
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
        className={classes.root}
      >
        <Grid container spacing={0} className={classes.container}>
          <Grid item xs={12}>
            <Card classes={{ root: classes.map }} variant="outlined" style={{ height: '30vh' }}>
              <Map selectedFile={file} />
            </Card>
          </Grid>
          {geoDIDMetadata}
        </Grid>
      </Grid>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        className={classes.modal}
        open={addChildrenModal}
        onClose={() => dispatchToggleAddGeoDIDAsChildrenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        disableAutoFocus
      >
        <Fade in={addChildrenModal} className={classes.modalPaper}>
          <ChildrenGeoDIDsTable
            type="Add"
            isModal
            allAvailableChildren={allAvailableChildrenToAdd}
            loading={loading}
            maxNumberOfRows={10}
          />
        </Fade>
      </Modal>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        className={classes.modal}
        open={addParentModal}
        onClose={() => dispatchToggleAddGeoDIDAsParentModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        disableAutoFocus
      >
        <Fade in={addParentModal} className={classes.modalPaper}>
          <ParentGeoDIDsTable
            type="Add"
            isModal
            allAvailableParents={allAvailableParentsToAdd}
            loading={loading}
            maxNumberOfRows={10}
          />
        </Fade>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  addChildrenModal: state.modals.addChildrenModal,
  addParentModal: state.modals.addParentModal,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSnackbarError: (errorMsg) => dispatch(snackbarError(errorMsg)),
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
  dispatchToggleAddGeoDIDAsChildrenModal: (open) => dispatch(toggleAddGeoDIDAsChildrenModal(open)),
  dispatchToggleAddGeoDIDAsParentModal: (open) => dispatch(toggleAddGeoDIDAsParentModal(open)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GeoDIDView);
