import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMapGL, { Source, Layer, FlyToInterpolator, WebMercatorViewport } from 'react-map-gl';
import { connect } from 'react-redux';
import { easeCubic } from 'd3-ease';
import { loadCogs, setSelectedCog } from 'core/redux/spatial-assets/actions';
import { Card, CardContent, CardActions, Button, Grid } from '@material-ui/core';
import 'mapbox-gl/dist/mapbox-gl.css';

const regex = /(?:\.([^.]+))?$/;

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: '10px',
    paddingLeft: '10px',
    paddingBottom: '10px',
    width: '100%',
    textAlign: 'center',
  },
  container: {
    height: '100%',
  },
  card: {
    borderRadius: '20px',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  map: {
    position: 'relative',
    height: '50%',
  },
  metadata: {
    height: '50%',
  },
}));

const Dashboard = (props) => {
  const {
    initialMapLoad,
    spatialAsset,
    spatialAssetLoaded,
    dispatchLoadCogs,
    loadedTiffJson,
    selectedCog,
    dispatchSetSelectedCog,
  } = props;

  const classes = useStyles();
  // const parentRef = useRef(null);

  const [viewport, setViewport] = useState({
    latitude: 30,
    longitude: 0,
    zoom: 2,
    width: '100%',
    height: '100%',
  });
  const [rasterSources, setRasterSources] = useState(null);
  const [selectedRasterSource, setSelectedRasterSource] = useState(null);

  const onStacDataLoad = (sAsset = null) => {
    if (sAsset) {
      const { longitude, latitude, zoom } = new WebMercatorViewport(viewport).fitBounds(
        [
          [sAsset.bbox[0], sAsset.bbox[1]],
          [sAsset.bbox[2], sAsset.bbox[3]],
        ],
        {
          padding: 20,
          offset: [0, -100],
        },
      );

      setViewport({
        ...viewport,
        longitude,
        latitude,
        zoom,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic,
      });
    } else {
      setViewport({
        ...viewport,
        latitude: 30,
        longitude: 0,
        zoom: 2,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic,
      });
    }
  };
  /*

  useEffect(() => {
    if (parentRef.current) {
      setViewport({
        ...viewport,
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, [parentRef]);

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        ...viewport,
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
 */
  useEffect(() => {
    if (spatialAssetLoaded && spatialAsset) {
      const cogs =
        spatialAsset.assets &&
        Object.values(spatialAsset.assets).reduce((newData, asset) => {
          if (regex.exec(asset.href)[1] === 'tif') {
            newData.push(asset.href);
          }
          return newData;
        }, []);

      onStacDataLoad(spatialAsset);

      if (cogs) {
        dispatchLoadCogs(cogs);
        dispatchSetSelectedCog(cogs[0]);
      }
    } else if (!initialMapLoad) {
      onStacDataLoad(null);
      setRasterSources(null);
      setSelectedRasterSource(null);
    }
  }, [spatialAssetLoaded, spatialAsset, initialMapLoad, dispatchLoadCogs]);

  useEffect(() => {
    if (loadedTiffJson) {
      const newRasterSources = [];

      loadedTiffJson.forEach((tiffJson) => {
        newRasterSources.push(
          <Source id={tiffJson.cog} key={tiffJson.cog} type="raster" tiles={tiffJson.tiles}>
            <Layer id={tiffJson.cog} type="raster" />
          </Source>,
        );
      });

      setRasterSources(newRasterSources);
    }
  }, [loadedTiffJson]);

  useEffect(() => {
    if (rasterSources && selectedCog) {
      setSelectedRasterSource(
        rasterSources.find((rasterSource) => rasterSource.key === selectedCog),
      );
    }
  }, [rasterSources, selectedCog]);

  const dataLayer = {
    id: 'dataLayer',
    source: 'geojson',
    type: 'fill',
    paint: { 'fill-color': '#228b22', 'fill-opacity': 0.4 },
  };

  console.log(viewport);

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justify="center"
      alignItems="stretch"
      className={classes.root}
    >
      <Grid item xs={4}>
        <Grid container spacing={0} className={classes.container}>
          <Grid item style={{ height: '10%' }} xs={6}>
            <Button size="small">Learn More</Button>
          </Grid>
          <Grid item style={{ height: '10%' }} xs={6}>
            <Button size="small">Learn More</Button>
          </Grid>
          <Grid item xs={12} style={{ height: '90%' }}>
            <Card classes={{ root: classes.card }} variant="outlined" style={{ height: '100%' }}>
              <CardContent style={{ height: '100%' }}>Geodidlist</CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={8}>
        <Grid container spacing={0} className={classes.container}>
          <Grid item xs={12}>
            <Card classes={{ root: classes.card }} variant="outlined" style={{ height: '48vh' }}>
              <CardContent style={{ height: '100%' }}>
                <ReactMapGL
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxApiAccessToken={process.env.REACT_APP_MapboxAccessToken}
                  // eslint-disable-next-line
                  {...viewport}
                  onViewportChange={(vp) => setViewport(vp)}
                >
                  {spatialAssetLoaded && (
                    <>
                      <Source id="geojson" type="geojson" data={spatialAsset.geometry}>
                        <Layer
                          // eslint-disable-next-line
                          {...dataLayer}
                        />
                      </Source>
                      {selectedRasterSource}
                    </>
                  )}
                </ReactMapGL>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card classes={{ root: classes.card }} variant="outlined" style={{ height: '48vh' }}>
              <CardContent style={{ height: '90%' }}>GeoDid metadata</CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => ({
  collapsed: state.settings.collapsed,
  initialMapLoad: state.settings.initialMapLoad,
  siderWidth: state.settings.siderWidth,
  spatialAsset: state.spatialAssets.spatialAsset,
  spatialAssetLoaded: state.spatialAssets.spatialAssetLoaded,
  loadedTiffJson: state.spatialAssets.loadedTiffJson,
  selectedCog: state.spatialAssets.selectedCog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchLoadCogs: (loadedCogs) => dispatch(loadCogs(loadedCogs)),
  dispatchSetSelectedCog: (selectedCog) => dispatch(setSelectedCog(selectedCog)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
