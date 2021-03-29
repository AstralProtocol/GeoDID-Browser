import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  ButtonBase,
  LinearProgress,
  IconButton,
} from '@material-ui/core';
// import { useQuery } from '@apollo/react-hooks';
// import geoDIDQuery from 'core/graphql/geoDIDQuery';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import Map from 'components/Map';
import {
  readFileAsync,
  getBytes32FromGeoDIDid,
  getBytes32FromCid,
  jsonToArray,
  blobToUint8,
} from 'utils';
import { useSnackbar } from 'notistack';
import { useSubscription } from '@apollo/react-hooks';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useAstral } from 'core/hooks/astral';
import { useWallet } from 'core/hooks/web3';
import { ethers } from 'ethers';
import Authorize from 'components/LayoutComponents/Authorize';
import { setSelectedParentCreation } from 'core/redux/spatial-assets/actions';
import geoDIDsSubscription from 'core/graphql/geoDIDsSubscription';

import ParentGeoDIDsTable from './ParentGeoDIDsTable';

import AssetsTable from './AssetsTable';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: '10px',
    paddingLeft: '10px',
    width: '100%',
  },
  map: {
    borderRadius: '20px',
  },
  assetsTable: {
    height: '30vh',
  },
  tableParent: {
    marginTop: '2vh',
  },
  dropzone: {
    minHeight: '10vh',
  },
  txArea: {
    borderRadius: '20px',
    marginTop: '3vh',
    width: '100%',
    height: '30vh',
    textAlign: 'center',
  },
  createWarning: {
    marginTop: '3vh',
    width: '100%',
    height: '15vh',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonWarning: {
    borderRadius: '20px',
    marginTop: '1vh',
    width: '100%',
    height: '15vh',
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
  createButton: {
    borderRadius: '20px',
    marginTop: '3vh',
    width: '100%',
    height: '30vh',
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

const Item = (props) => {
  const { tx, contracts, address, tokenId, setTokenId } = useWallet();
  const { astralInstance } = useAstral();
  const classes = useStyles();
  const parentRef = useRef(null);
  const [fileObjects, setFileObjs] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [txState, setTxState] = useState({
    txSending: false,
    txComplete: false,
  });
  const [firstTime, setFirstTime] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const { parent, dispatchSetSelectedParentCreation } = props;

  const { data, loading } = useSubscription(geoDIDsSubscription, {
    variables: {
      where: {
        ...{ active: true },
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

  const handleAdd = async (newFiles) => {
    let currentFiles = [...files];
    let currentFileObjects = [...fileObjects];

    try {
      await Promise.all(
        newFiles.map(async (f) => {
          const fNew = f.file;
          if (
            fNew.type === 'application/json' ||
            fNew.type === 'image/tiff' ||
            fNew.type === 'image/tif'
          ) {
            if (currentFiles.length > 0) {
              const foundFile = currentFiles.find((file) => file.tag === fNew.name);
              console.log(foundFile);
              if (!foundFile) {
                let newFile = {};
                if (fNew.type === 'application/json') {
                  try {
                    const readFile = await readFileAsync(fNew, true);
                    const geoJsonData = JSON.parse(readFile);
                    const jsonBytes = jsonToArray(readFile);

                    newFile = {
                      tag: fNew.name,
                      type: 'GeoJSON',
                      size: fNew.size,
                      data: geoJsonData,
                      bytes: jsonBytes,
                    };
                    enqueueSnackbar(`${newFile.tag} added`, {
                      variant: 'success',
                    });

                    currentFiles = [...currentFiles, newFile];
                    currentFileObjects = [...currentFileObjects, f];
                  } catch {
                    enqueueSnackbar(`Couldn't parse GeoJson`, {
                      variant: 'warning',
                    });
                  }
                } else {
                  try {
                    const uint8Array = await blobToUint8(fNew);

                    newFile = {
                      tag: fNew.name,
                      type: 'GeoTIFF',
                      size: fNew.size,
                      data: fNew,
                      bytes: uint8Array,
                    };
                    enqueueSnackbar(`${newFile.tag} added`, {
                      variant: 'success',
                    });

                    currentFiles = [...currentFiles, newFile];
                    currentFileObjects = [...currentFileObjects, f];
                  } catch {
                    enqueueSnackbar(`Couldn't parse GeoTiff`, {
                      variant: 'warning',
                    });
                  }
                }
              } else {
                enqueueSnackbar(`File already exists`, {
                  variant: 'warning',
                });
              }
            } else {
              let newFile = {};
              if (fNew.type === 'application/json') {
                const readFile = await readFileAsync(fNew, true);
                const geoJsonData = JSON.parse(readFile);
                const jsonBytes = jsonToArray(readFile);

                newFile = {
                  tag: fNew.name,
                  type: 'GeoJSON',
                  size: fNew.size,
                  data: geoJsonData,
                  bytes: jsonBytes,
                };
                currentFiles = [...currentFiles, newFile];
                currentFileObjects = [...currentFileObjects, f];
              } else {
                const uint8Array = await blobToUint8(fNew);

                newFile = {
                  tag: fNew.name,
                  type: 'GeoTIFF',
                  size: fNew.size,
                  data: fNew,
                  bytes: uint8Array,
                };
                currentFiles = [...currentFiles, newFile];
                currentFileObjects = [...currentFileObjects, f];
              }
            }
          } else {
            enqueueSnackbar(`Wrong file type. Only geotiff and geojsons are accepted`, {
              variant: 'warning',
            });
          }
        }),
      );
    } finally {
      setFiles(currentFiles);
      setFileObjs(currentFileObjects);
    }
  };

  const createGeoDID = async () => {
    let bytes32Parent;

    if (parent) {
      bytes32Parent = getBytes32FromGeoDIDid(parent);
    } else {
      bytes32Parent = ethers.utils.formatBytes32String('');
    }

    const genDocRes = await astralInstance.createGenesisGeoDID('item');

    let results;

    if (tokenId) {
      results = await astralInstance.pinDocument(genDocRes, tokenId);
    } else {
      results = await astralInstance.pinDocument(genDocRes);
    }

    const bytes32GeoDID = getBytes32FromGeoDIDid(results.geodidid);

    const bytes32Cid = getBytes32FromCid(results.cid);

    let txOptions = {
      txState: {
        setTxState,
      },
    };

    if (files && files.length > 0) {
      const dataArray = files.reduce((newDataArray, file) => {
        newDataArray.push({
          type: file.type,
          tag: file.tag,
          bytes: file.bytes,
        });
        return newDataArray;
      }, []);
      txOptions = {
        ...txOptions,
        addAssets: {
          astralInstance,
          geodidId: results.geodidid,
          data: dataArray,
        },
      };
    }

    if (tokenId) {
      txOptions = {
        ...txOptions,
        token: {
          tokenId,
          setTokenId,
          firstTime: false,
        },
      };
    } else {
      txOptions = {
        ...txOptions,
        token: {
          tokenId: results.token,
          setTokenId,
          firstTime: true,
          setFirstTime,
        },
      };
    }

    console.log(txOptions);
    try {
      await tx(
        contracts.SpatialAssets.registerSpatialAsset(
          address,
          bytes32GeoDID,
          bytes32Parent,
          [],
          bytes32Cid,
          ethers.utils.formatBytes32String('FILECOIN'),
          1,
        ),
        enqueueSnackbar,
        txOptions,
      );
      dispatchSetSelectedParentCreation(null);
    } catch (err) {
      console.log(err);
    }
  };

  let txArea;

  if (txState.txSending && !txState.txComplete) {
    txArea = (
      <div className={classes.txArea}>
        <Typography variant="h4" gutterBottom>
          Creating GeoDID
        </Typography>
        <LinearProgress />
      </div>
    );
  } else if (!txState.txSending && !txState.txComplete && !tokenId) {
    txArea = (
      <>
        <Typography variant="body2" gutterBottom display="inline" className={classes.createWarning}>
          ⚠️ Your token has not been detected, if you have one add it to your account area,
          otherwise a new one will be created for you
        </Typography>
        <ButtonBase className={classes.createButtonWarning} onClick={() => createGeoDID()}>
          <Typography variant="h4" gutterBottom display="inline">
            Create GeoDID
          </Typography>
        </ButtonBase>
      </>
    );
  } else if (!txState.txSending && !txState.txComplete && tokenId) {
    txArea = (
      <ButtonBase className={classes.createButton} onClick={() => createGeoDID()}>
        <Typography variant="h4" gutterBottom>
          Create GeoDID
        </Typography>
      </ButtonBase>
    );
  } else if (!txState.txSending && txState.txComplete && firstTime) {
    txArea = (
      <div className={classes.txArea}>
        <Typography variant="h4" gutterBottom>
          GeoDID Created
        </Typography>
        <Typography variant="body2" gutterBottom>
          Click to view it
        </Typography>
        <Typography variant="body2" gutterBottom>
          Token id: {tokenId}
          <IconButton onClick={() => navigator.clipboard.writeText(tokenId)}>
            <FileCopyIcon />
          </IconButton>
        </Typography>
        <Typography variant="body2" gutterBottom>
          Your token is the key to your GeoDIDs, keep it in a secure location as it is needed for
          the next time
        </Typography>
      </div>
    );
  } else if (!txState.txSending && txState.txComplete && !firstTime) {
    txArea = (
      <ButtonBase className={classes.createButton} onClick={() => createGeoDID()}>
        <Typography variant="h4" gutterBottom>
          Create another GeoDID
        </Typography>
      </ButtonBase>
    );
  }

  return (
    <Authorize redirect>
      <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
        <CardContent>
          <Typography variant="h3" component="h1" gutterBottom>
            {'Create GeoDID > Item'}
          </Typography>
          <Grid container style={{ height: '100%' }} spacing={2} direction="row" justify="center">
            <Grid item xs={6}>
              <DropzoneAreaBase
                fileObjects={fileObjects}
                onAdd={(added) => handleAdd(added)}
                dropzoneText="Drag and drop GeoJSON or GeoTIFF files"
                acceptedFiles={['image/tiff', 'application/json']}
                clearOnUnmount
                showAlerts={false}
                showPreviewsInDropzone={false}
                dropzoneClass={classes.dropzone}
              />
              <div className={classes.assetsTable}>
                <AssetsTable
                  selectedAsset={selectedFile}
                  setSelectedAsset={setSelectedFile}
                  files={files}
                  fileObjects={fileObjects}
                  maxNumberOfRows={5}
                  setFiles={setFiles}
                  setFileObjs={setFileObjs}
                  maxFileSize={10000000}
                />
              </div>
              <div className={classes.tableParent}>
                <ParentGeoDIDsTable
                  type="Add"
                  allAvailableParents={allAvailableParentsToAdd}
                  loading={loading}
                  maxNumberOfRows={5}
                  isDisabled={false}
                />
              </div>
            </Grid>
            <Grid item xs={6} style={{ height: '100%' }}>
              <Card
                classes={{ root: classes.map }}
                variant="outlined"
                style={{ height: '48vh' }}
                ref={parentRef}
              >
                <Map selectedFile={selectedFile} />
              </Card>
              {txArea}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Authorize>
  );
};

const mapStateToProps = (state) => ({
  parent: state.spatialAssets.parent,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetSelectedParentCreation: (parent) => dispatch(setSelectedParentCreation(parent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
