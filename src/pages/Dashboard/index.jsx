import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMapGL, { Source, Layer, FlyToInterpolator, WebMercatorViewport } from 'react-map-gl';
import { connect } from 'react-redux';
import { easeCubic } from 'd3-ease';
import { loadCogs, setSelectedCog } from 'core/redux/spatial-assets/actions';
import SearchBar from 'material-ui-search-bar';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { Virtuoso } from 'react-virtuoso';
import 'mapbox-gl/dist/mapbox-gl.css';

const regex = /(?:\.([^.]+))?$/;

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: '10px',
    paddingLeft: '10px',
    paddingBottom: '10px',
    width: '100%',
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
  scrollbar: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
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
  const parentRef = useRef(null);

  const [viewport, setViewport] = useState({
    latitude: 30,
    longitude: 0,
    zoom: 2,
    width: '100%',
    height: '100%',
  });
  const [rasterSources, setRasterSources] = useState(null);
  const [selectedRasterSource, setSelectedRasterSource] = useState(null);
  const [searchValue, setSearchValue] = useState('');

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
          <Grid item xs={3} style={{ height: '10vh' }}>
            <Button fullWidth size="small" className={classes.button}>
              Filter
            </Button>
          </Grid>
          <Grid item xs={9} style={{ height: '10vh' }}>
            <SearchBar
              className={classes.searchBar}
              placeholder="Search GeoDID"
              value={searchValue}
              onChange={(newValue) => setSearchValue(newValue)}
              onRequestSearch={() => console.log(searchValue)}
            />
          </Grid>
          <Grid item xs={12} style={{ height: '86vh' }}>
            <Card classes={{ root: classes.list }} variant="outlined">
              <CardContent style={{ height: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Browse GeoDIDs
                </Typography>
                <Virtuoso
                  style={{ height: '90%' }}
                  totalCount={200}
                  itemContent={(index) => (
                    <ListItem button key={index} onClick={() => console.log(index)}>
                      <ListItemText primary={`Item ${index + 1}`} />
                    </ListItem>
                  )}
                  components={{
                    Scroller: React.forwardRef(({ style, children }, ref) => (
                      // an alternative option to assign the ref is
                      // <div ref={(r) => ref.current = r}>
                      <div
                        style={{
                          ...style,
                        }}
                        ref={ref}
                        className={classes.scrollbar}
                      >
                        {children}
                      </div>
                    )),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={8}>
        <Grid container spacing={0} className={classes.container}>
          <Grid item xs={12}>
            <Card
              classes={{ root: classes.map }}
              variant="outlined"
              style={{ height: '48vh' }}
              ref={parentRef}
            >
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
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card
              classes={{ root: classes.metadata }}
              variant="outlined"
              style={{ height: '48vh' }}
            >
              <CardContent style={{ height: '90%' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Selected GeoDID Metadata
                </Typography>
              </CardContent>
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
