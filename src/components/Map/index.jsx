import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import createParser from 'core/parsers/parserFactory';
import { GeoJSON, Map, TileLayer } from 'react-leaflet';
import { LinearProgress } from '@material-ui/core';
import { GEO_JSON_MARKER_OPTIONS, GEOJSON_OVERLAY } from 'utils/constants';
import { uuidv4, readFileAsync } from 'utils';

const LeafletMap = (props) => {
  const { selectedFile } = props;
  const map = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({
    zoom: 2,
    center: L.latLng(42, -16),
  });

  const [showLoader, setShowLoader] = useState(false);
  const [showError, setShowError] = useState(false);
  const [overlays, setOverlays] = useState([]);

  function onMoveEnd(e) {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    setZoomPosition({ zoom, position: center });
  }

  useEffect(() => {
    // load script
    const script = document.createElement('script');
    script.src =
      'https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/dist/leaflet.canvaslayer.field.js';
    script.async = true;

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const loadGeoJson = async () => {
      if (selectedFile && selectedFile.type === 'GeoJSON') {
        console.log(selectedFile);
        setShowError(false);
        setShowLoader(true);
        try {
          const parser = createParser(selectedFile, map);
          const layerData = await parser.createLayer();

          setZoomPosition({ zoom: layerData.zoom, center: layerData.center });
          setOverlays((ov) => [...ov, { show: true, data: layerData, id: uuidv4() }]);
        } catch (ex) {
          console.log(ex);
          setShowError(true);
        } finally {
          setShowLoader(false);
        }
      } else {
        setZoomPosition({
          zoom: 5,
          center: L.latLng(20, 0),
        });
        setOverlays([]);
      }
    };

    loadGeoJson();
  }, [selectedFile]);

  useEffect(() => {
    const loadGeoTiff = async () => {
      console.log(selectedFile);
      if (selectedFile && selectedFile.type === 'GeoTIFF') {
        console.log(selectedFile);
        setShowError(false);
        setShowLoader(true);
        try {
          const buffer = await readFileAsync(selectedFile.data, false);
          const s = L.ScalarField.fromGeoTIFF(buffer);
          console.log(s);
          const layer = L.canvasLayer.scalarField(s).addTo(map.current.leafletElement);

          map.current.leafletElement.fitBounds(layer.getBounds());
        } catch (ex) {
          console.log(ex);
          setShowError(true);
        } finally {
          setShowLoader(false);
        }
      } else {
        setZoomPosition({
          zoom: 5,
          center: L.latLng(20, 0),
        });
        setOverlays([]);
      }
    };

    loadGeoTiff();
  }, [selectedFile]);

  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, GEO_JSON_MARKER_OPTIONS);
  }

  function popUp(f, l) {
    const out = [];
    if (f.properties) {
      // eslint-disable-next-line
      for (const key in f.properties) {
        out.push(key + ': ' + f.properties[key]);
      }
      l.bindPopup(out.join('<br />'));
    }
  }

  let assetsLoadedArea;

  if (overlays && overlays.length > 0) {
    assetsLoadedArea = (
      <div style={{ height: '5%', width: '100%', textAlign: 'center' }}> Asset Loaded</div>
    );
  } else if (!showLoader) {
    assetsLoadedArea = (
      <div style={{ height: '5vh', width: '100%', textAlign: 'center' }}>
        Load an asset to view it on the map
      </div>
    );
  } else if (showLoader && !showError) {
    assetsLoadedArea = (
      <div style={{ height: '5vh', width: '100%', textAlign: 'center' }}>
        <LinearProgress />
      </div>
    );
  }
  return (
    <>
      {assetsLoadedArea}
      <Map
        style={{ height: '95vh', width: '100%', zIndex: 1 }}
        center={zoomPosition.center}
        zoom={zoomPosition.zoom}
        onMoveEnd={onMoveEnd}
        maxZoom={30}
        ref={map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {overlays.map((overlay) => {
          if (overlay.data.type === GEOJSON_OVERLAY && overlay.show) {
            return (
              <GeoJSON
                key={overlay.id}
                data={overlay.data.data}
                pointToLayer={pointToLayer}
                onEachFeature={popUp}
              />
            );
          }
          return null;
        })}
      </Map>
    </>
  );
};

export default LeafletMap;
