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
import { useSubscription } from '@apollo/react-hooks';
import geoDIDSubscription from 'core/graphql/geoDIDSubscription';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';
import Map from 'components/Map';
import { useWallet } from 'core/hooks/web3';
import { snackbarError, toggleAddGeoDIDAsChildrenModal } from 'core/redux/modals/actions';
import { getBytes32FromGeoDIDid, getBytes32FromCid, getShortGeoDID, getShortAddress } from 'utils';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import ChildrenGeoDIDsTable from 'components/ChildrenGeoDIDsTable';

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
  scrollbar: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
  relationships: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const GeoDIDView = (props) => {
  const history = useHistory();
  const { tx, contracts, address } = useWallet();
  const {
    match: { params },
    dispatchSnackbarError,
    dispatchSetSelectedGeoDID,
    dispatchToggleAddGeoDIDAsChildrenModal,
    addChildrenModal,
  } = props;
  const { geoDIDID } = params;

  const classes = useStyles();
  const parentRef = useRef(null);

  const { data: dataSelected, loading: loadingSelected } = useSubscription(geoDIDSubscription, {
    variables: {
      geoDIDID,
    },
  });

  const selectedGeoDID = dataSelected ? dataSelected.geoDID : null;

  const { data: dataChildren, loading: loadingChildren } = useSubscription(geoDIDsSubscription, {
    variables: {
      where: {
        ...{},
      },
    },
  });

  const allAvailableChildrenToAdd = dataChildren
    ? dataChildren.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (geoDID.parent === null) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const allAvailableChildrenToRemove = dataChildren
    ? dataChildren.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (geoDID.parent === geoDIDID) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const createGeoDID = async () => {
    const geoDID = 'did:geo:QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
    const cid = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';
    try {
      tx(
        contracts.SpatialAssets.registerSpatialAsset(
          address,
          getBytes32FromGeoDIDid(geoDID),
          ethers.utils.formatBytes32String(''),
          [],
          getBytes32FromCid(cid),
          ethers.utils.formatBytes32String('FILECOIN'),
          0,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleGeoDIDSelection = (value) => {
    dispatchSetSelectedGeoDID(value);
    history.push(`/browse/${value}`);
  };
  /*
  const handleRemoveChild = (childToRemove) => {
    tx(
      contracts.SpatialAssets.removeChildrenGeoDIDs(getBytes32FromGeoDIDid(geoDIDID), [
        getBytes32FromGeoDIDid(childToRemove),
      ]),
    );
  };


  const handleRemoveAllChildren = () => {
    console.log(1);
  };
*/
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
      );
      history.push('/dashboard');
      dispatchSetSelectedGeoDID(null);
    } else {
      dispatchSnackbarError('No selected GeoDID');
    }
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
                <List className={classes.relationships}>
                  <ListItem key="geoDIDid" role={undefined} dense>
                    <ListItemText id="geoDIDid" primary="GeoDID" />
                    <ListItemSecondaryAction>
                      <Tooltip title={selectedGeoDID.id}>
                        <Typography variant="subtitle1" gutterBottom>
                          {getShortGeoDID(selectedGeoDID.id)}
                        </Typography>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem key="cid" role={undefined} dense>
                    <ListItemText id="cid" primary="ContentID" />
                    <ListItemSecondaryAction>
                      <Tooltip title={selectedGeoDID.cid}>
                        <Typography variant="subtitle1" gutterBottom>
                          {getShortAddress(selectedGeoDID.cid)}
                        </Typography>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem key="type" role={undefined} dense>
                    <ListItemText id="type" primary="Type" />
                    <ListItemSecondaryAction>
                      <Typography variant="subtitle1" gutterBottom>
                        {selectedGeoDID.type}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {selectedGeoDID.parent ? (
                    <ListItem
                      role={undefined}
                      dense
                      button
                      onClick={() => handleGeoDIDSelection(selectedGeoDID.parent)}
                    >
                      <ListItemText primary={getShortGeoDID(selectedGeoDID.parent)} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="comments">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ) : (
                    <ListItem role={undefined} dense>
                      <ListItemText primary="GeoDID has no parent" />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5" component="h1" gutterBottom display="block">
                  Children Relationships
                </Typography>
                {selectedGeoDID.type === 'Collection' && (
                  <>
                    <ChildrenGeoDIDsTable
                      type="Remove"
                      allAvailableChildren={allAvailableChildrenToRemove}
                      loading={loadingChildren}
                      maxNumberOfRows={3}
                    />

                    <List className={classes.relationships}>
                      <ListItem
                        role={undefined}
                        dense
                        button
                        onClick={() => dispatchToggleAddGeoDIDAsChildrenModal(true)}
                      >
                        <ListItemText primary="GeoDID Collection has no children - Click to add" />
                      </ListItem>
                    </List>
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
    geoDIDMetadata = '';
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
            loading={loadingChildren}
            maxNumberOfRows={10}
          />
        </Fade>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  addChildrenModal: state.modals.addChildrenModal,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSnackbarError: (errorMsg) => dispatch(snackbarError(errorMsg)),
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
  dispatchToggleAddGeoDIDAsChildrenModal: (open) => dispatch(toggleAddGeoDIDAsChildrenModal(open)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GeoDIDView);
