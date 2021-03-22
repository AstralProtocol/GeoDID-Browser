import * as React from 'react';
import { useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import createParser from 'core/parsers/parserFactory';
import { ImageOverlay, GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { IMAGE_OVERLAY, GEO_JSON_MARKER_OPTIONS, GEOJSON_OVERLAY } from 'utils/constants';
import { uuidv4 } from 'utils';

/* eslint-disable */

/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
/* eslint-enable */

const LeafletMap = () => {
  const [map, setMap] = useState(null);

  const [zoomPosition, setZoomPosition] = useState({
    zoom: 5,
    position: L.latLng(20, 0),
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

  function onMoveEnd(e) {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    setZoomPosition({ zoom, position: center });
  }

  async function onDrop(e) {
    e.preventDefault();
    setShowError(false);
    setShowLoader(true);
    try {
      const files = e.dataTransfer.files;
      const parser = createParser(files, map);
      const layerData = await parser.createLayer();

      console.log(layerData);
      if (layerData) {
        setZoomPosition({ zoom: layerData.zoom, position: layerData.center });
        setOverlays((ov) => [...ov, { show: true, data: layerData, id: uuidv4() }]);
      }
    } catch (ex) {
      console.log(ex);
      setShowError(true);
    } finally {
      setShowLoader(false);
    }
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

  console.log(zoomPosition);
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}>
      <MapContainer
        style={{ height: 'calc(100vh - 50px)', width: 'calc(100vw - 250px)' }}
        center={zoomPosition.position}
        zoom={zoomPosition.zoom}
        onMoveEnd={onMoveEnd}
        maxZoom={30}
        preferCanvas
        zoomControl
        whenCreated={setMap}
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
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
