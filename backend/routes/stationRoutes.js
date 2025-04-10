import express from 'express';
import Station from '../models/Station.js';

const router = express.Router();

// POST - Add a new station
router.post('/', async (req, res) => {
  try {
    const { name, address, location, gazoilPrice, dieselPrice } = req.body;

    const newStation = new Station({
      name,
      address,
      location, // should be in format: { type: "Point", coordinates: [lng, lat] }
      gazoilPrice,
      dieselPrice
    });

    const savedStation = await newStation.save();
    res.status(201).json(savedStation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Get stations near user OR all stations if no lat/lng is given
router.get('/', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  // Convert lat and lng to numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid latitude or longitude' });
  }

  try {
    const stations = await Station.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude] // Ensure correct order [longitude, latitude]
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 15000, // 15 km radius
        }
      },
      { $sort: { gazoilPrice: 1 } }
    ]);

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
