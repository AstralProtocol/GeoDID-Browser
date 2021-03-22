import * as React from 'react';
import { useState, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import createParser from 'core/parsers/parserFactory';
import { ImageOverlay, GeoJSON } from 'react-leaflet';
import { IMAGE_OVERLAY, GEOJSON_OVERLAY, GEO_JSON_MARKER_OPTIONS } from 'utils/constants';
import { uuidv4 } from 'utils';
import loam from 'loam';
import Map from './Map';

require('loam/lib/loam-worker.js');
require('gdal-js/gdal.js');
require('gdal-js/gdal.wasm');
require('gdal-js/gdal.data');

loam.initialize();

/* This code is needed to properly load the images in the Leaflet CSS */
/* eslint-disable */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
/* eslint-enable */

const LeafletMap = () => {
  const mapRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({
    zoom: 12,
    position: L.latLng(32.0461, 34.8516),
  });
  const [showLoader, setShowLoader] = useState(false);
  const [showError, setShowError] = useState(false);
  const [overlays, setOverlays] = useState([]);

  console.log(showLoader);
  console.log(showError);
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function onDrop(e) {
    e.preventDefault();
    setShowError(false);
    setShowLoader(true);
    try {
      const files = e.dataTransfer.files;
      const parser = createParser(files, mapRef);
      const layerData = await parser.createLayer();
      setZoomPosition({ zoom: layerData.zoom, position: layerData.center });
      setOverlays((ovelays) => [...ovelays, { show: true, data: layerData, id: uuidv4() }]);
    } catch (ex) {
      console.log(ex);
      setShowError(true);
    } finally {
      setShowLoader(false);
    }
  }

  function onMoveEnd(e) {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    setZoomPosition({ zoom, position: center });
  }

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

  return (
    <div onDragOver={onDragOver} onDrop={onDrop}>
      <Map
        onMoveEnd={onMoveEnd}
        position={zoomPosition.position}
        zoom={zoomPosition.zoom}
        ref={mapRef}
      >
        {overlays.map((overlay) => {
          if (overlay.data.type === IMAGE_OVERLAY && overlay.show) {
            return (
              <ImageOverlay
                key={overlay.id}
                url={overlay.data.imageUrl}
                bounds={overlay.data.bounds}
              />
            );
          }
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
    </div>
  );
};

export default LeafletMap;
