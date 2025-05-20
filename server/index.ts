import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from TypeScript server!');
});

// create an endpoint to accept the id of the day of week and airport, which calls the model and returns both the chances the flight will be delayed and the confidence percent of the prediction.
// creating an endpoint which returns the list of airport names and IDs, sorted in alphabetical order.
// all data is returned as JSON.

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
