import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ethers } from 'ethers';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  ButtonBase,
  Card,
  CardContent,
  Grid,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
} from '@material-ui/core';
import { useSubscription } from '@apollo/react-hooks';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';
import {
  setSelectedParentCreation,
  setSelectedChildrenCreation,
} from 'core/redux/spatial-assets/actions';
import { useAstral } from 'core/hooks/astral';
import { useWallet } from 'core/hooks/web3';
import { useSnackbar } from 'notistack';
import { getBytes32FromGeoDIDid, getBytes32FromCid } from 'utils';
import ChildrenGeoDIDsTable from './ChildrenGeoDIDsTable';
import ParentGeoDIDsTable from './ParentGeoDIDsTable';

const AstralCheckbox = withStyles({
  root: {
    color: '#f97b3d',
    '&$checked': {
      color: '#f97b3d',
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: '10px',

    paddingBottom: '10px',
    width: '100%',
  },
  container: {
    paddingTop: '10px',
    paddingLeft: '10px',
    width: '100%',
  },

  tables: {
    width: '100%',
  },
  createButton: {
    width: '100%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    color: theme.palette.primary.grey,
    '&:hover': {
      background: 'linear-gradient(45deg, #ffa300 30%, #f97b3d 90%)',
      color: '#fff',
    },
  },
}));

const Collection = (props) => {
  const { tx, contracts, address } = useWallet();
  const { astralInstance } = useAstral();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const [selectedRoot, setSelectedRoot] = useState(false);

  const {
    dispatchSetSelectedParentCreation,
    parent,
    children,
    dispatchSetSelectedChildrenCreation,
  } = props;

  const handleChangeRoot = () => {
    setSelectedRoot(!selectedRoot);
    if (!selectedRoot) {
      dispatchSetSelectedParentCreation(null);
    }
  };

  const { data, loading } = useSubscription(geoDIDsSubscription, {
    variables: {
      where: {
        ...{},
      },
    },
  });

  const allAvailableParentsToAdd = data
    ? data.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (geoDID.type === 'Collection' && (!geoDID.parent || geoDID.parent.length === 0)) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const allAvailableChildrenToAdd = data
    ? data.geoDIDs.reduce((geoDIDIds, geoDID) => {
        if (!geoDID.parent || geoDID.parent.length === 0) {
          geoDIDIds.push(geoDID);
        }
        return geoDIDIds;
      }, [])
    : [];

  const createGeoDID = async () => {
    /* eslint-disable */
    if (!parent && !selectedRoot) {
      enqueueSnackbar(`Root must be selected if no parents are added`, {
        variant: 'warning',
      });
      return;
    } else if (parent) {
      const foundParent = children.find((child) => child === parent);

      if (foundParent) {
        enqueueSnackbar(`The same GeoDID cannot be added as parent and children`, {
          variant: 'error',
        });
        return;
      }
    }
    /* eslint-enable */

    let bytes32Parent;

    if (parent) {
      bytes32Parent = getBytes32FromGeoDIDid(parent);
    } else {
      bytes32Parent = ethers.utils.formatBytes32String('');
    }

    let bytes32Children;

    if (children.length > 0) {
      bytes32Children = children.reduce((bytes32Ids, child) => {
        bytes32Ids.push(getBytes32FromGeoDIDid(child));

        return bytes32Ids;
      }, []);
    } else {
      bytes32Children = [];
    }

    const genDocRes = await astralInstance.createGenesisGeoDID('collection');

    const results = await astralInstance.pinDocument(genDocRes);

    const bytes32GeoDID = getBytes32FromGeoDIDid(results.geodidid);

    const bytes32Cid = getBytes32FromCid(results.cid);

    try {
      tx(
        contracts.SpatialAssets.registerSpatialAsset(
          address,
          bytes32GeoDID,
          bytes32Parent,
          bytes32Children,
          bytes32Cid,
          ethers.utils.formatBytes32String('FILECOIN'),
          0,
        ),
        enqueueSnackbar,
      );
      dispatchSetSelectedParentCreation(null);
      dispatchSetSelectedChildrenCreation([]);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
      <CardContent>
        <Grid container style={{ height: '100%' }} spacing={2} direction="row" justify="center">
          <Grid item xs={10}>
            <Typography variant="h3" component="h1" gutterBottom>
              {'Create GeoDID > GeoDID Collection'}
            </Typography>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="start"
                  control={
                    <AstralCheckbox
                      checked={selectedRoot}
                      onChange={handleChangeRoot}
                      name="root"
                    />
                  }
                  label={
                    <Typography variant="h5" component="h1">
                      Root GeoDID?
                    </Typography>
                  }
                  labelPlacement="start"
                />
              </FormGroup>
            </FormControl>
            <div className={classes.tables}>
              <ParentGeoDIDsTable
                type="Add"
                allAvailableParents={allAvailableParentsToAdd}
                loading={loading}
                maxNumberOfRows={5}
                isDisabled={selectedRoot}
              />
              <ChildrenGeoDIDsTable
                type="Add"
                allAvailableChildren={allAvailableChildrenToAdd}
                loading={loading}
                maxNumberOfRows={5}
              />
            </div>
          </Grid>
          <Grid item xs={2}>
            <ButtonBase className={classes.createButton} onClick={() => createGeoDID()}>
              <Typography variant="h4" gutterBottom>
                Create
              </Typography>
            </ButtonBase>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  parent: state.spatialAssets.parent,
  children: state.spatialAssets.children,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetSelectedChildrenCreation: (children) =>
    dispatch(setSelectedChildrenCreation(children)),
  dispatchSetSelectedParentCreation: (parent) => dispatch(setSelectedParentCreation(parent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
