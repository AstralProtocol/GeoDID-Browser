import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { ethers } from 'ethers';
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
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { useSubscription } from '@apollo/react-hooks';
import geoDIDSubscription from 'core/graphql/geoDIDSubscription';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';
import Map from 'components/Map';
import { useAstral } from 'core/hooks/astral';
import { useWallet } from 'core/hooks/web3';
import {
  snackbarError,
  toggleAddGeoDIDAsChildrenModal,
  toggleAddGeoDIDAsParentModal,
} from 'core/redux/modals/actions';
import { getBytes32FromGeoDIDid, getBytes32FromCid } from 'utils';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import ChildrenGeoDIDsTable from 'components/ChildrenGeoDIDsTable';
import ParentGeoDIDsTable from 'components/ParentGeoDIDsTable';
import { useSnackbar } from 'notistack';

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
  const { tx, contracts, address } = useWallet();
  const { astralInstance } = useAstral();
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

  const classes = useStyles();
  const parentRef = useRef(null);

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

  const createGeoDID = async () => {
    const genDocRes = await astralInstance.createGenesisGeoDID('item');
    console.log(genDocRes);

    // With the returned IDocumentInfo from the last function, we can pin it.
    // Since no token was specified the client will assign a new auth Token to the user.

    const results = await astralInstance.pinDocument(genDocRes);
    console.log(results);

    // const token = results.token;

    // register the geodid id and cid obtained. Type 0 because it is a collection

    console.log(results.geodidid);
    console.log(results.cid);

    const bytes32GeoDID = getBytes32FromGeoDIDid(results.geodidid);
    const bytes32Cid = getBytes32FromCid(results.cid);

    try {
      tx(
        contracts.SpatialAssets.registerSpatialAsset(
          address,
          bytes32GeoDID,
          ethers.utils.formatBytes32String(''),
          [],
          bytes32Cid,
          ethers.utils.formatBytes32String('FILECOIN'),
          1,
        ),
        enqueueSnackbar,
      );
    } catch (err) {
      console.log(err);
    }
  };

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

  let geoDIDMetadata;

  if (selectedGeoDID) {
    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '48vh' }}>
          <CardContent style={{ height: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography variant="h5" component="h1" gutterBottom display="inline">
                  Quick Actions
                </Typography>
                <List component="nav" aria-label="main mailbox folders">
                  <ListItem button onClick={createGeoDID}>
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Edit" />
                  </ListItem>
                  <ListItem button onClick={handleDeletion}>
                    <ListItemIcon>
                      <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Deactivate GeoDID" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" component="h1" gutterBottom>
                  GeoDID Metadata
                </Typography>
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
                      dense
                      onClick={() => handleGeoDIDSelection(selectedGeoDID.parent)}
                      button
                    >
                      <ListItemText id="type" primary="Parent" secondary={selectedGeoDID.parent} />
                      <ListItemSecondaryAction>
                        <Tooltip title="Remove parent" aria-label="add">
                          <IconButton
                            edge="end"
                            aria-label="comments"
                            onClick={() => handleParentDelete(selectedGeoDID.parent)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ) : (
                    <ListItem key="parent" role={undefined} dense onClick={() => null} button>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  } else if (!selectedGeoDID && loadingSelected) {
    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '48vh' }}>
          <CardContent style={{ height: '100%', alignItems: 'center', textAlign: 'center' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      </Grid>
    );
  } else {
    geoDIDMetadata = (
      <Grid item xs={12}>
        <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '48vh' }}>
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
            <Card
              classes={{ root: classes.map }}
              variant="outlined"
              style={{ height: '48vh' }}
              ref={parentRef}
            >
              <Map parentRef={parentRef} />
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
