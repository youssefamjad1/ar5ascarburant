import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import gasPump from '../assets/gas-pump.png';

const API_URL = import.meta.env.VITE_API_URL;

const stationIcon = new Icon({
  iconUrl: gasPump,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const userIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
});

const HomePage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location', error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    setLoading(true);
    const { lat, lng } = userLocation;

    axios
      .get(`${API_URL}/api/stations`, {
        params: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      })
      .then((response) => {
        setStations(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stations:', error);
        setLoading(false);
      });
  }, [userLocation]);

  const RoutingControl = ({ selectedStation, userLocation }) => {
    const map = useMap();
    const routeRef = useRef(null);

    useEffect(() => {
      if (!selectedStation || !userLocation) return;

      if (routeRef.current && routeRef.current._container) {
        map.removeControl(routeRef.current);
      }

      const newRoute = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(
            selectedStation.location.coordinates[1],
            selectedStation.location.coordinates[0]
          ),
        ],
        routeWhileDragging: true,
        createMarker: () => null,
      }).addTo(map);

      routeRef.current = newRoute;

      if (newRoute.getBounds) {
        map.fitBounds(newRoute.getBounds());
      }

      return () => {
        if (routeRef.current && routeRef.current._container) {
          map.removeControl(routeRef.current);
        }
      };
    }, [selectedStation, userLocation, map]);

    return null;
  };

  if (loading || !userLocation) return <div>Loading map...</div>;

  return (
    <div className="home-container">
      <h2>🗺️ Fuel Stations Near You</h2>

      <div>
        <h4>Choose a station based on distance or fuel price:</h4>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedStation(null);
              return;
            }
            try {
              setSelectedStation(JSON.parse(value));
            } catch (err) {
              console.error('Invalid station data', err);
            }
          }}
        >
          <option value="">Select a station</option>
          {stations
            .sort((a, b) => a.distance - b.distance || a.gazoilPrice - b.gazoilPrice)
            .map((station) => (
              <option key={station._id} value={JSON.stringify(station)}>
                {station.name} - {(station.distance / 1000).toFixed(2)} km - Gazoil: {station.gazoilPrice} MAD - Diesel: {station.dieselPrice} MAD
              </option>
            ))}
        </select>
      </div>

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '500px', width: '100%', marginTop: '1rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>📍 <strong>You are here</strong></Popup>
        </Marker>

        {stations.map((station) => (
          <Marker
            key={station._id}
            position={[station.location.coordinates[1], station.location.coordinates[0]]}
            icon={stationIcon}
          >
            <Popup>
              <strong>{station.name}</strong><br />
              {station.address}<br />
              🛢️ Gazoil: {station.gazoilPrice} MAD<br />
              🔥 Diesel: {station.dieselPrice} MAD<br />
              📏 {(station.distance / 1000).toFixed(2)} km from you
            </Popup>
          </Marker>
        ))}

        <RoutingControl selectedStation={selectedStation} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

export default HomePage;