import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Use import.meta.url to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
  res.send('Hello from TypeScript server!');
});

// Endpoint to predict flight delay chance and confidence
app.get('/predict', (req, res) => {
  const dayOfWeek = String(req.query.dayOfWeek ?? '');
  const airportId = String(req.query.airportId ?? '');

  // Use .js extension for ESM compatibility if needed
  const scriptPath = path.join(__dirname, 'predict.py');
  const py = spawn('python3', [scriptPath, dayOfWeek, airportId]);

  let data = '';
  py.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  py.on('close', () => {
    try {
      const result = JSON.parse(data);
      res.json(result);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.error('Raw data:', data);
      res.status(500).json({ error: 'Invalid response from Python script' });
    }
  });
});

// Endpoint to get list of airport names and IDs, sorted alphabetically
app.get('/airports', (req, res) => {
  const airportsPath = path.join(__dirname, '../data/airports.csv');
  import('fs').then(fs => {
    fs.readFile(airportsPath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: 'Could not read airports file' });
        return;
      }
      const lines = data.trim().split('\n');
      const header = lines[0].split(',');
      const airports = lines.slice(1).map(line => {
        const [AirportID, AirportName] = line.split(',');
        return { AirportID, AirportName };
      });
      // Already sorted in the CSV, but sort again for safety
      airports.sort((a, b) => a.AirportName.localeCompare(b.AirportName));
      res.json(airports);
    });
  });
});

// creating an endpoint which returns the list of airport names and IDs, sorted in alphabetical order.
// all data is returned as JSON.

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
