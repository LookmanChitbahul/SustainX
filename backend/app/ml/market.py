"""
ml/market.py
────────────
Energy Market Price Prediction
Derives "Green Coin price" from supply/demand per billing cycle
and forecasts future cycles using Linear Regression.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
import logging

logger = logging.getLogger(__name__)


def compute_market_data(db_session) -> dict:
    """
    Supply  = total Yellow Coins generated (prosumer net exports)
    Demand  = total Red Coins consumed (consumer grid imports)
    Price   = demand / supply  →  higher demand vs supply = higher price
    """
    from app.models.model import MeterReading, User

    readings = db_session.query(MeterReading).filter(MeterReading.processed == True).all()

    cycles: dict = {}
    for r in readings:
        cycles.setdefault(r.billing_cycle, {"supply": 0.0, "demand": 0.0})
        user = db_session.query(User).filter(User.user_id == r.user_id).first()
        if not user:
            continue
        net = r.export_kwh - r.import_kwh
        if user.user_type == "prosumer" and net > 0:
            cycles[r.billing_cycle]["supply"] += net
        else:
            cycles[r.billing_cycle]["demand"] += r.import_kwh

    history = []
    for cycle_num in sorted(cycles):
        c = cycles[cycle_num]
        supply = max(c["supply"], 0.1)
        demand = c["demand"]
        history.append({
            "cycle": cycle_num,
            "supply": round(supply, 2),
            "demand": round(demand, 2),
            "price": round(demand / supply, 2),
        })

    predictions = []
    supply_confidence = 0.0
    demand_confidence = 0.0

    if len(history) >= 2:
        X = np.array([h["cycle"] for h in history]).reshape(-1, 1)
        y_price  = np.array([h["price"]  for h in history])
        y_supply = np.array([h["supply"] for h in history])
        y_demand = np.array([h["demand"] for h in history])

        price_model  = LinearRegression().fit(X, y_price)
        supply_model = LinearRegression().fit(X, y_supply)
        demand_model = LinearRegression().fit(X, y_demand)

        supply_confidence = round(max(supply_model.score(X, y_supply) * 100, 60.0), 1)
        demand_confidence = round(max(demand_model.score(X, y_demand) * 100, 60.0), 1)

        last_cycle = max(h["cycle"] for h in history)
        for offset in range(1, 4):
            fc = last_cycle + offset
            X_pred = np.array([[fc]])
            predictions.append({
                "cycle": fc,
                "predicted_price":  round(max(float(price_model.predict(X_pred)[0]),  0.01), 2),
                "predicted_supply": round(max(float(supply_model.predict(X_pred)[0]), 0.0),  2),
                "predicted_demand": round(max(float(demand_model.predict(X_pred)[0]), 0.0),  2),
                "is_prediction": True,
            })

    return {
        "history": history,
        "predictions": predictions,
        "supply_confidence": supply_confidence,
        "demand_confidence": demand_confidence,
        "current_price": history[-1]["price"] if history else 0,
        "price_trend": (
            "up" if len(history) >= 2 and history[-1]["price"] > history[-2]["price"]
            else "down"
        ),
    }
