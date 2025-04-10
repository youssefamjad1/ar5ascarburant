import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import stationRoutes from './routes/stationRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// Routes
app.use('/api/stations', stationRoutes);
