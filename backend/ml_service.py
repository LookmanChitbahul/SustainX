import numpy as np
from sklearn.ensemble import IsolationForest
import logging

# A mock ML service integrating into the SustainX architecture.
# Predicts anomalous energy injections to prevent arbitrary value creation.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pre-trained model simulation
# In production, this would be trained on historical `meter_readings`
dummy_X_train = np.array([
    [5, 25], [6, 28], [4, 22], [3, 20], [5, 30],  # normal prosumer behavior
    [30, 0], [35, 0], [28, 0], [40, 0], [32, 0],  # normal consumer behavior
])
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(dummy_X_train)

def check_anomaly(import_kwh: float, export_kwh: float) -> bool:
    """
    Returns True if the reading is anomalous (e.g., impossible export spike),
    meaning the Value Generation should be held for review.
    """
    prediction = model.predict(np.array([[import_kwh, export_kwh]]))
    # -1 means anomaly, 1 means normal
    is_anomaly = prediction[0] == -1
    if is_anomaly:
        logger.warning(f"Anomaly detected for reading: import={import_kwh}, export={export_kwh}")
    return is_anomaly
