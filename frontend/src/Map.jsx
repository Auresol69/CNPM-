import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function Map() {
  return (
    <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[10.762622, 106.660172]}>
        <Popup>Xin chào từ SG 🗺️</Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;
