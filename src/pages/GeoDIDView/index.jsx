import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Grid,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useQuery } from '@apollo/react-hooks';
import geoDIDQuery from 'core/graphql/geoDIDQuery';
import Map from 'components/Map';
import { useWallet } from 'core/hooks/web3';
import { snackbarError } from 'core/redux/modals/actions';
import { getBytes32FromGeoDIDid, getBytes32FromCid } from 'utils';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';

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
  } = props;
  const { geoDIDID } = params;

  const handleToggle = (value) => {
    dispatchSetSelectedGeoDID(value);
    history.push(`/browse/${value}`);
  };

  const classes = useStyles();
  const parentRef = useRef(null);
  // const [geoDIDID, setSelectedGeoDIDId] = useState(null);
  const { data: dataSelected, loading: loadingSelected } = useQuery(geoDIDQuery, {
    variables: {
      geoDIDID,
    },
  });

  const selectedGeoDID = dataSelected ? dataSelected.geoDID : null;

  const childrenGeoDIDs = selectedGeoDID.edges
    ? selectedGeoDID.edges.reduce((geoDIDIds, edge) => {
        geoDIDIds.push(edge.childGeoDID.id);

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
                    <ListItemText primary="Delete" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={1}>
                <Divider orientation="vertical" flexItem className={classes.divider} />
              </Grid>
              <Grid item xs={5}>
                <Typography variant="h5" component="h1" gutterBottom>
                  GeoDID Metadata
                </Typography>
                <Grid container spacing={0} direction="row" justify="center">
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      GeoDID ID
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      Content ID
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      Type
                    </Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedGeoDID.id}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedGeoDID.cid}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedGeoDID.type}
                    </Typography>
                  </Grid>
                </Grid>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" component="h1" gutterBottom display="block">
                  Relationships
                </Typography>
                <Typography variant="body1" component="div" gutterBottom display="block">
                  Parent
                </Typography>
                <List className={classes.relationships}>
                  <ListItem key={1} role={undefined} dense button>
                    <ListItemText id={1} primary="Line item 1" />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="comments">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Typography variant="body1" component="div" gutterBottom display="block">
                  Children
                </Typography>
                <List className={classes.relationships}>
                  {childrenGeoDIDs.map((geoDIDId) => {
                    const labelId = `checkbox-list-label-${geoDIDId}`;

                    return (
                      <ListItem
                        key={geoDIDId}
                        role={undefined}
                        dense
                        button
                        onClick={handleToggle(geoDIDId)}
                      >
                        <ListItemText
                          id={labelId}
                          primary={`${geoDIDId.substr(0, 15)}... ${geoDIDId.substr(-4)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="comments">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
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
            <CircularProgress />;
          </CardContent>
        </Card>
      </Grid>
    );
  } else {
    geoDIDMetadata = '';
  }

  return (
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
  );
};

const mapDispatchToProps = (dispatch) => ({
  dispatchSnackbarError: (errorMsg) => dispatch(snackbarError(errorMsg)),
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
});

export default connect(null, mapDispatchToProps)(GeoDIDView);
