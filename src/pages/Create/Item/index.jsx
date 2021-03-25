import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
// import { useQuery } from '@apollo/react-hooks';
// import geoDIDQuery from 'core/graphql/geoDIDQuery';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import Map from 'components/Map';
import { readFileAsync, loadLoam } from 'utils';
import { useSnackbar } from 'notistack';

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

const Item = () => {
  const classes = useStyles();
  const parentRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = async (newFiles) => {
    console.log(newFiles);

    console.log(files);
    const currentFiles = [...files];

    console.log(currentFiles);
    newFiles.forEach(async (f) => {
      const fNew = f.file;
      if (
        fNew.type === 'application/json' ||
        fNew.type === 'image/tiff' ||
        fNew.type === 'image/tif'
      ) {
        if (files.length > 0) {
          const foundFile = files.find((file) => file.name === fNew.name);
          if (!foundFile) {
            let newFile = {};
            if (fNew.type === 'application/json') {
              try {
                const data = await readFileAsync(fNew, true);
                const geoJsonData = JSON.parse(data);

                newFile = {
                  name: fNew.name,
                  type: 'geojson',
                  size: fNew.size,
                  data: geoJsonData,
                };
                enqueueSnackbar(`${newFile.name} added`, {
                  variant: 'success',
                });

                setFiles([...files, newFile]);
              } catch {
                enqueueSnackbar(`Couldn't parse GeoJson`, {
                  variant: 'warning',
                });
              }
            } else {
              try {
                const loam = await loadLoam();

                newFile = {
                  name: fNew.name,
                  type: 'geotiff',
                  size: fNew.size,
                  data: await loam.open(fNew),
                };
                enqueueSnackbar(`${newFile.name} added`, {
                  variant: 'success',
                });

                setFiles([...files, newFile]);
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
            const data = await readFileAsync(fNew, true);
            const geoJsonData = JSON.parse(data);

            newFile = {
              name: fNew.name,
              type: 'geojson',
              size: fNew.size,
              data: geoJsonData,
            };
            setFiles([...files, newFile]);
            enqueueSnackbar(`${newFile.name} added`, {
              variant: 'success',
            });
          } else {
            const loam = await loadLoam();

            newFile = {
              name: fNew.name,
              type: 'geotiff',
              size: fNew.size,
              data: await loam.open(fNew),
            };
            setFiles([...files, newFile]);
            enqueueSnackbar(`${newFile.name} added`, {
              variant: 'success',
            });
          }
        }
      } else {
        enqueueSnackbar(`Wrong file type. Only geotiff and geojsons are accepted`, {
          variant: 'warning',
        });
      }
    });
  };

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
              clearOnUnmount
              showAlerts={false}
            />

            <AssetsTable
              selectedAsset={selectedFile}
              setSelectedAsset={setSelectedFile}
              files={files}
              maxNumberOfRows={5}
              setFiles={setFiles}
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

export default Item;
