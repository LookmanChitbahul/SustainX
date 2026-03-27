from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
import logic

router = APIRouter()

@router.post("/users", response_model=schemas.UserResponse)
def create_user(user_id: str, user_type: models.UserType, meter_id: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = models.User(user_id=user_id, user_type=user_type, meter_id=meter_id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # create empty wallet
    wallet = models.Wallet(user_id=new_user.user_id)
    db.add(wallet)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/{user_id}/wallet", response_model=schemas.WalletResponse)
def get_user_wallet(user_id: str, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

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

@router.post("/transfer", response_model=schemas.TransactionBase)
def transfer_value(sender_id: str, request: schemas.TransferRequest, db: Session = Depends(get_db)):
    try:
        tx = logic.execute_transfer(db, sender_id, request.receiver_id, request.amount)
        return tx
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
