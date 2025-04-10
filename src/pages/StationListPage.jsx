import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';

function StationListPage() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      axios.get(`http://localhost:5000/api/stations?lat=${latitude}&lng=${longitude}`)
        .then(response => {
          setStations(response.data);
        })
        .catch(error => {
          console.error("Error fetching stations: ", error);
        });
    });
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Nearest Stations
      </Typography>
      <List>
        {stations.map(station => (
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
