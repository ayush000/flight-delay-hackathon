import express from 'express';
import { isValidDayOfWeek, isValidAirportId, airportIdExists, runPredictionScript } from './utils.js';

export function createPredictRoute(airportIdSet: Set<string>, __dirname: string) {
  const router = express.Router();
  router.get('/predict', (req, res) => {
    const dayOfWeek = String(req.query.dayOfWeek ?? '');
    const airportId = String(req.query.airportId ?? '');

    if (!isValidDayOfWeek(dayOfWeek)) {
      res.status(400).json({ error: 'Invalid dayOfWeek. Must be integer 1-7.' });
      return;
    }
    if (!isValidAirportId(airportId)) {
      res.status(400).json({ error: 'Invalid airportId. Must be a positive integer.' });
      return;
    }
    if (!airportIdExists(airportId, airportIdSet)) {
      res.status(400).json({ error: 'airportId not found in airports list.' });
      return;
    }

    runPredictionScript(dayOfWeek, airportId, __dirname, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(result);
      }
    });
  });
  return router;
}

export function createAirportsRoute(airportsList: { AirportID: string, AirportName: string }[]) {
  const router = express.Router();
  router.get('/airports', (req, res) => {
    res.json(airportsList);
  });
  return router;
}
