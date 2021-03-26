import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import createParser from 'core/parsers/parserFactory';
import { ImageOverlay, GeoJSON, Map, TileLayer } from 'react-leaflet';
import { IMAGE_OVERLAY, GEO_JSON_MARKER_OPTIONS, GEOJSON_OVERLAY } from 'utils/constants';
import { uuidv4 } from 'utils';

/* This code and underlying dependencies have been based on https://github.com/aviklai/react-leaflet-load-geodata
   with adaptations to load loam dependencies from unpkg

    <link rel="prefetch" href="https://unpkg.com/gdal-js@2.0.0/gdal.js" />
    <link rel="prefetch" href="https://unpkg.com/gdal-js@2.0.0/gdal.data" />
    <link rel="prefetch" href="https://unpkg.com/gdal-js@2.0.0/gdal.wasm" />
    <link rel="prefetch" href="https://unpkg.com/loam@1.0.0-rc.2/lib/loam-worker.js" />
Have been added to public/index.html to prefetch
*/

/* eslint-disable */
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
/* eslint-enable */

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

  console.log(showLoader);
  console.log(showError);

  function onMoveEnd(e) {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    setZoomPosition({ zoom, position: center });
  }

  useEffect(() => {
    const loadAsset = async () => {
      if (selectedFile) {
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

    loadAsset();
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

  console.log(zoomPosition);
  console.log(overlays);
  return (
    <Map
      style={{ height: '100%', width: '100%' }}
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
  );
};

export default LeafletMap;
