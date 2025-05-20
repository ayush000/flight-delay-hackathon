import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createPredictRoute, createAirportsRoute } from './routes.js';

const app = express();
const port = process.env.PORT || 3000;

// Use import.meta.url to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read airports.csv once at startup
const airportsPath = path.join(__dirname, '../data/airports.csv');
let airportsList: { AirportID: string, AirportName: string }[] = [];
let airportIdSet: Set<string> = new Set();
try {
  const data = fs.readFileSync(airportsPath, 'utf8');
  const lines = data.trim().split('\n');
  airportsList = lines.slice(1).map(line => {
    const parts = line.split(',');
    const AirportID = parts[0];
    const AirportName = parts.slice(1).join(',');
    return { AirportID, AirportName };
  });
  airportsList.sort((a, b) => a.AirportName.localeCompare(b.AirportName));
  airportIdSet = new Set(airportsList.map(a => a.AirportID));
} catch (err) {
  console.error('Could not read airports file at startup:', err);
}

app.get('/', (req, res) => {
  res.send('Hello from TypeScript server!');
});

// Use modular routes
app.use(createPredictRoute(airportIdSet, __dirname));
app.use(createAirportsRoute(airportsList));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
