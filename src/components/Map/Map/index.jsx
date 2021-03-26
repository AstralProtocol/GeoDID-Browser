import * as React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const AppMap = (props) => (
  <MapContainer
    style={{ height: 'calc(100vh - 50px)', width: 'calc(100vw - 250px)' }}
    center={props.position}
    zoom={props.zoom}
    onMoveEnd={props.onMoveEnd}
    maxZoom={30}
    preferCanvas
    zoomControl
    ref={props.forwardedRef}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    />
    {props.children}
  </MapContainer>
);

export default React.forwardRef((props, ref) => <AppMap {...props} forwardedRef={ref} />);
