import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { setSelectedGeoDID } from 'core/redux/spatial-assets/actions';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
// import { useQuery } from '@apollo/react-hooks';
// import geoDIDQuery from 'core/graphql/geoDIDQuery';
import Map from 'components/Map';
import { readFileAsync, loadLoam } from 'utils';

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
  const [selectedFile, setSelectedFile] = useState(null);

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function onDrop(e) {
    e.preventDefault();

    const fNew = e.dataTransfer.files;

    if (
      fNew[0].type === 'application/json' ||
      fNew[0].type === 'image/tiff' ||
      fNew[0].type === 'image/tif'
    ) {
      if (files.length > 0) {
        const foundFile = files.find((file) => file.name === fNew[0].name);
        if (!foundFile) {
          let newFile = {};
          if (fNew[0].type === 'application/json') {
            const data = await readFileAsync(fNew[0], true);
            const geoJsonData = JSON.parse(data);

            newFile = {
              name: fNew[0].name,
              type: 'geojson',
              size: fNew[0].size,
              data: geoJsonData,
            };
          } else {
            const loam = await loadLoam();

            newFile = {
              name: fNew[0].name,
              type: 'geotiff',
              size: fNew[0].size,
              data: await loam.open(fNew[0]),
            };
          }

          const updatedFiles = [...files, newFile];
          setFiles(updatedFiles);
        }
      } else {
        let newFile = {};
        if (fNew[0].type === 'application/json') {
          const data = await readFileAsync(fNew[0], true);
          const geoJsonData = JSON.parse(data);

          newFile = {
            name: fNew[0].name,
            type: 'geojson',
            size: fNew[0].size,
            data: geoJsonData,
          };
        } else {
          const loam = await loadLoam();

          newFile = {
            name: fNew[0].name,
            type: 'geotiff',
            size: fNew[0].size,
            data: await loam.open(fNew[0]),
          };
        }
        const updatedFiles = [...files, newFile];

        setFiles(updatedFiles);
      }
    }
  }

  console.log(selectedFile);

  return (
    <Card classes={{ root: classes.container }} variant="outlined" style={{ height: '96vh' }}>
      <CardContent>
        <Typography variant="h3" component="h1" gutterBottom>
          {'Create GeoDID > Item'}
        </Typography>
        <Grid container style={{ height: '100%' }} spacing={2} direction="row" justify="center">
          <Grid item xs={6}>
            <div
              onDragOver={onDragOver}
              onDrop={onDrop}
              style={{ width: '200px', height: '200px', outline: '2px dashed' }}
            >
              Drop here
            </div>
            <AssetsTable
              selectedAsset={selectedFile}
              setSelectedAsset={setSelectedFile}
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
              <Map selectedFile={selectedFile} />
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
