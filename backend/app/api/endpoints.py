from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models import model as models
from app.schemas import schema as schemas
from app.services import energy_logic as logic
from app import ml_service

router = APIRouter()

@router.post("/login", response_model=schemas.UserResponse)
def login(request: schemas.UserLogin, db: Session = Depends(get_db)):
    from sqlalchemy import func
    clean_id = request.user_id.strip()
    user = db.query(models.User).filter(func.lower(models.User.user_id) == clean_id.lower()).first()
    if not user or user.password != request.password.strip():
        raise HTTPException(status_code=401, detail="Invalid User ID or Password")
    return user

# ── Users ──────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users in the system."""
    return db.query(models.User).all()

@router.get("/users/{user_id}", response_model=schemas.UserWithWallet)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get a single user with wallet."""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/{user_id}/wallet", response_model=schemas.WalletResponse)
def get_user_wallet(user_id: str, db: Session = Depends(get_db)):
    """Get wallet balances for a user."""
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

@router.get("/users/{user_id}/transactions", response_model=List[schemas.TransactionResponse])
def get_user_transactions(user_id: str, db: Session = Depends(get_db)):
    """Get transaction history for a user (sent or received)."""
    txs = db.query(models.Transaction).filter(
        (models.Transaction.sender_id == user_id) | (models.Transaction.receiver_id == user_id)
    ).order_by(models.Transaction.timestamp.desc()).all()
    return txs

# ── Data Ingestion & Processing ────────────────────────────

@router.post("/ingest")
def ingest_reading(reading: schemas.MeterReadingCreate, db: Session = Depends(get_db)):
    new_reading = models.MeterReading(
        user_id=reading.user_id,
        import_kwh=reading.import_kwh,
        export_kwh=reading.export_kwh,
        billing_cycle=reading.billing_cycle
    )
    db.add(new_reading)
    db.commit()
    return {"message": "Reading ingested successfully"}

@router.post("/process-cycle/{cycle}")
def process_cycle(cycle: int, db: Session = Depends(get_db)):
    logic.process_billing_cycle(db, cycle)
    return {"message": f"Cycle {cycle} processed successfully!"}

# ── Transfers ──────────────────────────────────────────────

@router.post("/transfer", response_model=schemas.TransactionResponse)
def transfer_value(request: schemas.TransferRequest, db: Session = Depends(get_db)):
    """Execute a value transfer from sender to receiver."""
    try:
        tx = logic.execute_transfer(db, request.sender_id, request.receiver_id, request.amount)
        return tx
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/settle", response_model=schemas.TransactionResponse)
def settle_debt_value(request: schemas.SettleRequest, db: Session = Depends(get_db)):
    """Settle grid debt using green coins."""
    try:
        tx = logic.settle_debt(db, request.user_id, request.amount)
        return tx
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ── Market & ML ────────────────────────────────────────────

@router.get("/market", response_model=schemas.MarketResponse)
def get_market_data(db: Session = Depends(get_db)):
    """Get energy market data: historical prices, supply/demand, and ML predictions."""
    return ml_service.compute_market_data(db)

from fastapi import Request

@router.get("/anomaly-check")
def get_anomaly_check_endpoint(request: Request):
    """Check if a reading is anomalous with confidence breakdown."""
    try:
        imp = float(request.query_params.get("import_kwh", 0))
        exp = float(request.query_params.get("export_kwh", 0))
        return ml_service.get_anomaly_confidence(imp, exp)
    except Exception as e:
        return {"error": str(e)}

@router.get("/blocks/{block_id}")
def get_block_endpoint(block_id: int, db: Session = Depends(get_db)):
    """Retrieve blockchain block metadata by ID."""
    block = db.query(models.Block).filter(models.Block.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block
