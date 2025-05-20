import sys
import os
import pickle
import pandas as pd

# Get arguments from command line
# Expect: dayOfWeek, airportId
if len(sys.argv) < 3:
    print('{"error": "Missing arguments"}')
    sys.exit(1)

try:
    day_of_week = int(sys.argv[1])
    airport_id = int(sys.argv[2])
except Exception:
    print('{"error": "Invalid arguments"}')
    sys.exit(1)

# Load model
model_path = os.path.join(os.path.dirname(__file__), '../data/model.pkl')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Prepare input for prediction
X = pd.DataFrame([[day_of_week, airport_id]], columns=["DayOfWeek", "DestAirportID"])

# Predict probability
proba = model.predict_proba(X)[0]
chance_delayed = float(proba[1])
confidence = float(max(proba))

# Output as JSON
import json
print(json.dumps({
    "chance_delayed": chance_delayed,
    "confidence": confidence
}))
