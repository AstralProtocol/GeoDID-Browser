import React, { useState } from 'react';
import { connect } from 'react-redux';
// import { ethers } from 'ethers';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  Card,
  Grid,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
} from '@material-ui/core';
import { useSubscription } from '@apollo/react-hooks';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';
import ChildrenGeoDIDsTable from './ChildrenGeoDIDsTable';
import ParentGeoDIDsTable from './ParentGeoDIDsTable';

/*
import { useAstral } from 'core/hooks/astral';
import { useWallet } from 'core/hooks/web3';
import { useSnackbar } from 'notistack';
*/

const AstralCheckbox = withStyles({
  root: {
    color: '#f97b3d',
    '&$checked': {
      color: '#f97b3d',
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const useStyles = makeStyles(() => ({
  title: {
    paddingTop: '3em',
  },
  root: {
    height: '100%',
    paddingTop: '10px',
    paddingLeft: '10px',
    paddingBottom: '10px',
    width: '100%',
  },
  container: {
    borderRadius: '20px',
  },
  innerCard: {
    marginLeft: '5em',
  },
}));

const Collection = () => {
  /*
  const { tx, contracts, address } = useWallet();
  const { astralInstance } = useAstral();
  const { enqueueSnackbar } = useSnackbar();
*/
  const classes = useStyles();
  const [selectedRoot, setSelectedRoot] = useState(false);

  const handleChangeRoot = () => {
    setSelectedRoot(!selectedRoot);
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

  /*
  const createGeoDID = async () => {
    const genDocRes = await astralInstance.createGenesisGeoDID('item');

    const results = await astralInstance.pinDocument(genDocRes);

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
  */
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justify="center"
      alignItems="stretch"
      className={classes.root}
    >
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
            <div className={classes.innerCard}>
              <div className={classes.title}>
                <Typography variant="h3" component="h1" gutterBottom>
                  {'Create GeoDID > GeoDID Collection'}
                </Typography>
              </div>
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
                <FormGroup aria-label="position" row>
                  <ParentGeoDIDsTable
                    type="Add"
                    allAvailableParents={allAvailableParentsToAdd}
                    loading={loading}
                    maxNumberOfRows={5}
                    isDisabled={selectedRoot}
                  />
                </FormGroup>
                <FormGroup aria-label="position" row>
                  <ChildrenGeoDIDsTable
                    type="Add"
                    allAvailableChildren={allAvailableChildrenToAdd}
                    loading={loading}
                    maxNumberOfRows={5}
                  />
                </FormGroup>
              </FormControl>
            </div>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => ({
  addChildrenModal: state.modals.addChildrenModal,
});

export default connect(mapStateToProps, null)(Collection);
