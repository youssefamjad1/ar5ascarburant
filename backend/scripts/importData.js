import mongoose from 'mongoose';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import Station from '../models/Station.js'; // Adjust the path if necessary

dotenv.config(); // Load environment variables from .env

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://youssef:itsmecar2025@ar5as-cluster.q7k09ub.mongodb.net/?retryWrites=true&w=majority&appName=ar5as-cluster';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Read the Excel file from the backend/data folder
const filePath = './data/ssdata.xlsx'; // Corrected path to the Excel file
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // Get the name of the first sheet
const worksheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Insert data into MongoDB
const insertData = async () => {
  try {
    // Loop through the data and insert it into the database
    for (const record of data) {
      // Check if the station already exists by its name (or any unique field like address)
      const existingStation = await Station.findOne({ name: record['name'] });

      if (existingStation) {
        console.log(`Station ${record['name']} already exists. Skipping insertion.`);
        continue; // Skip inserting if it already exists
      }

      const station = new Station({
        name: record['name'], // Column name in the Excel file should match 'name'
        address: record['address'], // Column name in the Excel file should match 'address'
        location: {
          type: 'Point',
          coordinates: [record['longitude'], record['latitude']], // Ensure your Excel file has these columns
        },
        gazoilPrice: record['gazoilPrice'], // Ensure your Excel file has this column
        dieselPrice: record['dieselPrice'], // Ensure your Excel file has this column
      });

      await station.save();
      console.log(`Inserted station: ${station.name}`);
    }

    console.log('Data import complete');
  } catch (err) {
    console.error('Error inserting data:', err);
  }
};

// Call the function to insert data
insertData().finally(() => mongoose.connection.close());
