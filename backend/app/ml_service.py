"""
ml_service.py — thin facade kept for backward compatibility.
All logic lives in ml/anomaly.py and ml/market.py.
"""
from app.ml.anomaly import is_anomaly as check_anomaly, confidence_report as get_anomaly_confidence
from app.ml.market import compute_market_data

__all__ = ["check_anomaly", "get_anomaly_confidence", "compute_market_data"]
