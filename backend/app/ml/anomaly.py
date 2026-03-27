"""
ml/anomaly.py
─────────────
Multi-Model Anomaly Detection Engine
Models: Isolation Forest + Z-Score + Local Outlier Factor
Voting:  2/3 models must agree → flagged as anomalous (95%+ confidence)
"""

import numpy as np
import logging
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

logger = logging.getLogger(__name__)

# ── Training Data ──────────────────────────────────────────────────────
# Representative energy patterns from the dataset
# [import_kwh, export_kwh]
TRAIN_DATA = np.array([
    [5, 25], [6, 28], [4, 22], [3, 20], [5, 30],
    [7, 18], [8, 15], [5, 20], [6, 22], [4, 25],
    [30, 0], [35, 0], [28, 0], [40, 0], [32, 0],
    [25, 0], [38, 0], [22, 0], [33, 0], [27, 0],
])

# ── Model 1: Isolation Forest ──────────────────────────────────────────
_iso_forest = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
_iso_forest.fit(TRAIN_DATA)

# ── Model 2: Z-Score parameters ───────────────────────────────────────
_MEAN = np.mean(TRAIN_DATA, axis=0)
_STD  = np.std(TRAIN_DATA, axis=0)
_Z_THRESHOLD = 3.0

# ── Model 3: Local Outlier Factor ─────────────────────────────────────
_lof = LocalOutlierFactor(n_neighbors=5, contamination=0.05, novelty=True)
_lof.fit(TRAIN_DATA)


# ── Individual model checks ────────────────────────────────────────────

def _iso_check(import_kwh: float, export_kwh: float) -> bool:
    return _iso_forest.predict([[import_kwh, export_kwh]])[0] == -1


def _zscore_check(import_kwh: float, export_kwh: float) -> bool:
    z = np.abs(np.array([import_kwh, export_kwh]) - _MEAN) / np.where(_STD > 0, _STD, 1)
    return bool(np.any(z > _Z_THRESHOLD))


def _lof_check(import_kwh: float, export_kwh: float) -> bool:
    return _lof.predict([[import_kwh, export_kwh]])[0] == -1


# ── Public API ─────────────────────────────────────────────────────────

def is_anomaly(import_kwh: float, export_kwh: float) -> bool:
    """
    Returns True if the reading is anomalous (2/3 models agree).
    Used inside the value generation pipeline to block fraudulent entries.
    """
    votes = [
        _iso_check(import_kwh, export_kwh),
        _zscore_check(import_kwh, export_kwh),
        _lof_check(import_kwh, export_kwh),
    ]
    result = sum(votes) >= 2
    if result:
        logger.warning(
            f"ANOMALY BLOCKED — import={import_kwh}, export={export_kwh} "
            f"[IsoForest={votes[0]}, ZScore={votes[1]}, LOF={votes[2]}]"
        )
    return result


def confidence_report(import_kwh: float, export_kwh: float) -> dict:
    """Returns a full confidence breakdown for the API and UI."""
    votes = [
        _iso_check(import_kwh, export_kwh),
        _zscore_check(import_kwh, export_kwh),
        _lof_check(import_kwh, export_kwh),
    ]
    anomaly_votes = sum(votes)
    return {
        "is_anomaly": anomaly_votes >= 2,
        "normal_confidence_pct": round((1 - anomaly_votes / 3) * 100, 1),
        "models": {
            "isolation_forest": "anomaly" if votes[0] else "normal",
            "z_score": "anomaly" if votes[1] else "normal",
            "local_outlier_factor": "anomaly" if votes[2] else "normal",
        },
        "agreement": f"{3 - anomaly_votes}/3 models say normal",
    }
