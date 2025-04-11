import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function StationListPage() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        axios
          .get(`${API_URL}/api/stations?lat=${latitude}&lng=${longitude}`)
          .then((response) => {
            setStations(response.data);
          })
          .catch((error) => {
            console.error('Error fetching stations: ', error);
          });
      },
      (error) => {
        console.error('Error getting user location: ', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Nearest Stations
      </Typography>
      <List>
        {stations.map((station) => (
          <ListItem key={station._id}>
            <ListItemText
              primary={`${station.name} - Gazoil: ${station.gazoilPrice} DH - Diesel: ${station.dieselPrice} DH`}
              secondary={`📍 ${station.address} — Distance: ${(station.distance / 1000).toFixed(2)} km`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default StationListPage;