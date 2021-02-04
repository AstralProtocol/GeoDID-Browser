import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMapGL, { Source, Layer, FlyToInterpolator, WebMercatorViewport } from 'react-map-gl';
import { connect } from 'react-redux';
import { easeCubic } from 'd3-ease';
import { loadCogs, setSelectedCog } from 'core/redux/spatial-assets/actions';
import 'mapbox-gl/dist/mapbox-gl.css';

const regex = /(?:\.([^.]+))?$/;

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(384px, 1fr))`,
    textAlign: 'center',
    justifyItems: 'center',
    minHeight: '100vh',
  },
  map: {
    position: 'relative',
    width: '100%',
    height: '500px',
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
  const parentRef = useRef(null);

  const classes = useStyles();

  const [viewport, setViewport] = useState({
    latitude: 30,
    longitude: 0,
    zoom: 2,
    width: `100%`,
    height: `100vh`,
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
    <div className={classes.root}>
      <div>empty</div>
      <div className={classes.map} ref={parentRef}>
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
      </div>
    </div>
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
