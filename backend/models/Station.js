import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    gazoilPrice: {
      type: Number,
      required: true,
    },
    dieselPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Create geospatial index for querying locations
stationSchema.index({ location: '2dsphere' });

const Station = mongoose.model('Station', stationSchema);

export default Station;