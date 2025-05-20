import pickle
import numpy as np
import pandas as pd

# Load the trained model
with open('data/model.pkl', 'rb') as f:
    model = pickle.load(f)

# Example input: DayOfWeek=3 (Wednesday), DestAirportID=12478
# Replace with your desired values
X_new = np.array([[3, 12478]])
feature_names = ['DayOfWeek', 'DestAirportID']
X_new_df = pd.DataFrame(X_new, columns=feature_names)

# Predict probability of delay > 15 min
prob = model.predict_proba(X_new_df)
print("Probability of delay > 15 min:", prob[0][1])

# Predict class (0 or 1)
pred = model.predict(X_new_df)
print("Predicted class (0=on time, 1=delayed):", pred[0])
