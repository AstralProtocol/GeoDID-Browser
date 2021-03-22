import React, { useEffect, useState } from 'react';
import * as L from 'leaflet';
import { fromBlob } from 'geotiff';
import 'leaflet-geotiff-2';

const App = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const map1 = L.map('map').setView([27.664198, 85.361624], 5);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map1);

    setMap(map1);
  }, []);

  async function onDrop(e) {
    e.preventDefault();
    try {
      const files = e.dataTransfer.files;

      L.leafletGeotiff(files[0], {
        renderer: null,
        bounds: [],
        band: 0,
        image: 0,
        clip: undefined,
        pane: 'overlayPane',
        onError: null,
        sourceFunction: fromBlob,
        arrayBuffer: null,
        noDataValue: undefined,
        noDataKey: undefined,
        blockSize: 65536,
        opacity: 1,
      }).addTo(map);
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <div
      onDrop={onDrop}
      style={{ height: 'calc(100vh - 50px)', width: 'calc(100vw - 250px)' }}
      id="map"
    />
  );
};

export default App;
