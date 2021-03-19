import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
// import { useQuery } from '@apollo/react-hooks';
// import geoDIDQuery from 'core/graphql/geoDIDQuery';
import Map from 'components/Map';
// import { fromBlob } from 'geotiff';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import AssetsTable from './AssetsTable';

const useStyles = makeStyles(() => ({
  container: {
    paddingTop: '10px',
    paddingLeft: '10px',
    width: '100%',
  },
  map: {
    borderRadius: '20px',
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const parentRef = useRef(null);
  const [files, setFiles] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleAdd = (newFiles) => {
    newFiles.forEach((newFile) => {
      const foundAsset = files.find((file) => file.name === newFile.name);
      if (!foundAsset) {
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
      }
    });
  };

  /*
  const handleDrop = async (droppedFiles) => {
    const tiff = await fromBlob(droppedFiles[0]);
    const image = await tiff.getImage(); // by default, the first image is read.

    console.log(image);
    if (image) {
      console.log(image.getBoundingBox());
    }
  };
*/
  return (
    <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
      <CardContent>
        <Typography variant="h3" component="h1" gutterBottom>
          {'Create GeoDID > Item'}
        </Typography>
        <Grid container style={{ height: '100%' }} spacing={2} direction="row" justify="center">
          <Grid item xs={6}>
            <DropzoneAreaBase
              onAdd={(added) => handleAdd(added)}
              dropzoneText="Drag and drop GeoJSON or GeoTIFF files"
              acceptedFiles={['image/tiff', 'application/json']}
              showPreviewsInDropzone={false}
              clearOnUnmount
              alertSnackbarProps={{ anchorOrigin: { horizontal: 'center', vertical: 'bottom' } }}
            />
            <AssetsTable
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              files={files}
              maxNumberOfRows={5}
            />
          </Grid>
          <Grid item xs={6}>
            <Card
              classes={{ root: classes.map }}
              variant="outlined"
              style={{ height: '48vh' }}
              ref={parentRef}
            >
              <Map selectedAsset={selectedAsset} parentRef={parentRef} />
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  geoDIDID: state.spatialAssets.geoDIDID,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
