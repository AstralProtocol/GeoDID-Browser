import React, { useEffect, useState } from 'react';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import ReactMapGL, { Source, Layer, FlyToInterpolator, WebMercatorViewport } from 'react-map-gl';
// import { easeCubic } from 'd3-ease';
import { fromBlob } from 'geotiff';
// import turf from 'turf';
import LeafletMap from './LeafletMap';

const MapLoader = (props) => {
  const { selectedAsset } = props;
  const [tiffAsset, setTiffAsset] = useState(null);
  const [geojsonAsset, setGeojsonAsset] = useState(null);

  console.log(tiffAsset);
  console.log(geojsonAsset);
  /*
  const [viewport, setViewport] = useState({
    latitude: 30,
    longitude: 0,
    zoom: 2,
    width: '100%',
    height: '100%',
  });

  */
  /*
  useEffect(() => {
    const updateViewport = async () => {
      if (geojsonAsset) {
        const bbox = turf.bbox(geojsonAsset);

        console.log(bbox);
        const { longitude, latitude, zoom } = new WebMercatorViewport(viewport).fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
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
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic,
        });
      } else if (tiffAsset) {
        const bbox = tiffAsset.getBoundingBox();

        console.log(bbox);
        /*
      const { longitude, latitude, zoom } = new WebMercatorViewport(viewport).fitBounds(
        [
          [boundingCorrect[0], boundingCorrect[1]],
          [boundingCorrect[2], boundingCorrect[3]],
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
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic,
      });
     
      } else {
        setViewport({
          ...viewport,
          latitude: 30,
          longitude: 0,
          zoom: 2,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic,
        });
      }
    };

    updateViewport();
  }, [geojsonAsset, tiffAsset]);

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
    const fetchAsset = async () => {
      if (selectedAsset) {
        if (selectedAsset.file.type === 'image/tiff') {
          setGeojsonAsset(null);
          const tiff = await fromBlob(selectedAsset.file);
          const image = await tiff.getImage(); // by default, the first image is read.
          setTiffAsset(image);
        } else if (selectedAsset.file.type === 'application/json') {
          setTiffAsset(null);
          // 29 = length of "data:application/json;base64,"
          const json = atob(selectedAsset.data.substring(29));
          const result = JSON.parse(json);
          setGeojsonAsset(result);
        }
      } else {
        setGeojsonAsset(null);
        setTiffAsset(null);
      }
    };

    fetchAsset();
  }, [selectedAsset]);

  /*
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

  const geoJsonDataLayer = {
    id: 'dataLayer',
    source: 'geojson',
    type: 'fill',
    paint: { 'fill-color': '#228b22', 'fill-opacity': 0.4 },
  };

  let mapSource;
  if (selectedAsset) {
    if (
      selectedAsset.file.type === 'application/json' &&
      geojsonAsset &&
      geojsonAsset.features.length > 0
    ) {
      mapSource = (
        <>
          <Source id="geojson" type="geojson" data={geojsonAsset.features[0].geometry}>
            <Layer
              // eslint-disable-next-line
              {...geoJsonDataLayer}
            />
          </Source>
        </>
      );
    } else if (selectedAsset.file.type === 'image/json' && tiffAsset) {
      mapSource = (
        <>
          <Source id="geojson" type="raster" data={geojsonAsset.features[0].geometry}>
            <Layer
              // eslint-disable-next-line
              {...geoJsonDataLayer}
            />
          </Source>
        </>
      );
    }
  }
*/
  return <LeafletMap />;
};

export default MapLoader;
