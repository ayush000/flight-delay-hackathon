import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Endpoint to predict flight delay chance and confidence
app.get('/predict', (req, res) => {
  const dayOfWeek = String(req.query.dayOfWeek ?? '');
  const airportId = String(req.query.airportId ?? '');

  // Validate dayOfWeek and airportId
  const day = Number(dayOfWeek);
  const airport = Number(airportId);
  if (!Number.isInteger(day) || day < 1 || day > 7) {
    res.status(400).json({ error: 'Invalid dayOfWeek. Must be integer 1-7.' });
    return;
  }
  if (!Number.isInteger(airport) || airport <= 0) {
    res.status(400).json({ error: 'Invalid airportId. Must be a positive integer.' });
    return;
  }
  if (!airportIdSet.has(airportId)) {
    res.status(400).json({ error: 'airportId not found in airports list.' });
    return;
  }

  const scriptPath = path.join(__dirname, 'predict.py');
  const py = spawn('python3', [scriptPath, dayOfWeek, airportId]);

  let dataOut = '';
  py.stdout.on('data', (chunk) => {
    dataOut += chunk.toString();
  });

  py.on('close', () => {
    try {
      const result = JSON.parse(dataOut);
      res.json(result);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.error('Raw data:', dataOut);
      res.status(500).json({ error: 'Invalid response from Python script' });
    }
  });
});

// Endpoint to get list of airport names and IDs, sorted alphabetically
app.get('/airports', (req, res) => {
  res.json(airportsList);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
