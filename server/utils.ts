import path from 'path';
import { spawn } from 'child_process';

export function isValidDayOfWeek(dayOfWeek: string): boolean {
  const day = Number(dayOfWeek);
  return Number.isInteger(day) && day >= 1 && day <= 7;
}

export function isValidAirportId(airportId: string): boolean {
  const airport = Number(airportId);
  return Number.isInteger(airport) && airport > 0;
}

export function airportIdExists(airportId: string, airportIdSet: Set<string>): boolean {
  return airportIdSet.has(airportId);
}

export function runPredictionScript(
  dayOfWeek: string,
  airportId: string,
  __dirname: string,
  callback: (err: Error | null, result?: any) => void
) {
  const scriptPath = path.join(__dirname, 'predict.py');
  const py = spawn('python3', [scriptPath, dayOfWeek, airportId]);
  let dataOut = '';
  py.stdout.on('data', (chunk) => {
    dataOut += chunk.toString();
  });
  py.on('close', () => {
    try {
      const result = JSON.parse(dataOut);
      callback(null, result);
    } catch (e) {
      callback(new Error('Invalid response from Python script'));
    }
  });
}
