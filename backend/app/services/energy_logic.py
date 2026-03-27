from sqlalchemy.orm import Session
from app.models.model import User, MeterReading, Wallet, Transaction, CoinType, TxType, TxStatus
from app import ml_service

def process_billing_cycle(db: Session, cycle: int):
    # Fetch all unprocessed meter readings for the cycle
    readings = db.query(MeterReading).filter(MeterReading.billing_cycle == cycle, MeterReading.processed == False).all()
    
    for reading in readings:
        if ml_service.check_anomaly(reading.import_kwh, reading.export_kwh):
            # Skip value generation for anomalies
            continue
            
        user = db.query(User).filter(User.user_id == reading.user_id).first()
        if not user:
            continue
            
        net_energy = reading.export_kwh - reading.import_kwh
        
        wallet = user.wallet
        if not wallet:
            wallet = Wallet(user_id=user.user_id)
            db.add(wallet)
            db.flush()
        
        # Determine value logic based on user type and net energy
        if user.user_type == "prosumer":
            if net_energy > 0:
                # Generate Yellow Coins for positive net contribution
                wallet.yellow_balance += net_energy
                tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Yellow, amount=net_energy, tx_type=TxType.Generation)
                db.add(tx)
            elif net_energy < 0:
                # Generate Red Coins as standard liability
                wallet.red_balance += abs(net_energy)
                tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Red, amount=abs(net_energy), tx_type=TxType.Generation)
                db.add(tx)
        
        elif user.user_type == "consumer":
            # Consumers typically only import, generating Red Coins
            wallet.red_balance += reading.import_kwh
            tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Red, amount=reading.import_kwh, tx_type=TxType.Generation)
            db.add(tx)
            
        reading.processed = True
        
    db.commit()

def execute_transfer(db: Session, sender_id: str, receiver_id: str, amount: float):
    sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender_id).first()
    receiver_wallet = db.query(Wallet).filter(Wallet.user_id == receiver_id).first()
    
    if not sender_wallet or not receiver_wallet:
        raise ValueError("Sender or Receiver wallet not found")
        
    # Validation: Sender must have enough Yellow Coins
    if sender_wallet.yellow_balance < amount:
        raise ValueError("Insufficient Yellow Coin balance")
        
    # Deduct from Sender
    sender_wallet.yellow_balance -= amount
    
    # Transformation: Yellow Coins turn into Green Coins upon transfer
    receiver_wallet.green_balance += amount
    
    # Log Transaction
    tx = Transaction(sender_id=sender_id, receiver_id=receiver_id, coin_type=CoinType.Green, amount=amount, tx_type=TxType.Transfer)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
