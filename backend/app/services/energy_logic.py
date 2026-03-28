from sqlalchemy.orm import Session
from app.models.model import User, MeterReading, Wallet, Transaction, CoinType, TxType, TxStatus, Block
from app import ml_service
import hashlib
from datetime import datetime

def mine_block(db: Session, data_summary: str) -> Block:
    # Get the last block in the chain
    last_block = db.query(Block).order_by(Block.id.desc()).first()
    prev_hash = last_block.current_hash if last_block else "0" * 64 # Genesis hash

    # Create current hash: SHA256(prev_hash + timestamp + summary)
    now = datetime.utcnow()
    raw_str = f"{prev_hash}{now.isoformat()}{data_summary}"
    current_hash = hashlib.sha256(raw_str.encode()).hexdigest()

    new_block = Block(
        prev_hash=prev_hash,
        current_hash=current_hash,
        data_summary=data_summary,
        timestamp=now
    )
    db.add(new_block)
    db.flush() # Get the ID
    return new_block

def process_billing_cycle(db: Session, cycle: int):
    # Fetch all unprocessed meter readings for the cycle
    readings = db.query(MeterReading).filter(MeterReading.billing_cycle == cycle, MeterReading.processed == False).all()
    
    # Create a block for this cycle
    block = mine_block(db, f"Billing Cycle {cycle} Processing")
    
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
                tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Yellow, amount=net_energy, tx_type=TxType.Generation, block_id=block.id)
                db.add(tx)
            elif net_energy < 0:
                # Generate Red Coins as standard liability
                wallet.red_balance += abs(net_energy)
                tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Red, amount=abs(net_energy), tx_type=TxType.Generation, block_id=block.id)
                db.add(tx)
        
        elif user.user_type == "consumer":
            # Consumers typically only import, generating Red Coins
            wallet.red_balance += reading.import_kwh
            tx = Transaction(receiver_id=user.user_id, coin_type=CoinType.Red, amount=reading.import_kwh, tx_type=TxType.Generation, block_id=block.id)
            db.add(tx)
            
        reading.processed = True
        
    db.commit()

def execute_transfer(db: Session, sender_id: str, receiver_id: str, amount: float):
    sender = db.query(User).filter(User.user_id == sender_id).first()
    receiver = db.query(User).filter(User.user_id == receiver_id).first()
    
    if not sender or not receiver:
        raise ValueError("Sender or Receiver not found")
        
    if sender_id == receiver_id:
        raise ValueError("Cannot transfer to yourself")

    sender_wallet = sender.wallet
    receiver_wallet = receiver.wallet
    
    # ── RULE 1: Prosumer -> Consumer (Yellow -> Green) ────────
    if sender.user_type == "prosumer":
        if receiver.user_type != "consumer":
            raise ValueError("Prosumers can only transfer to Consumers")
        
        if sender_wallet.yellow_balance < amount:
            raise ValueError(f"Insufficient Yellow balance ({sender_wallet.yellow_balance})")
            
        sender_wallet.yellow_balance -= amount
        receiver_wallet.green_balance += amount
        msg = f"Prosumer Export ({amount} Yellow) -> Market Supply ({amount} Green)"

    # ── RULE 2: Consumer -> Consumer (Green -> Green) ─────────
    elif sender.user_type == "consumer":
        if receiver.user_type != "consumer":
            raise ValueError("Consumers can only transfer to other Consumers")
        
        if sender_wallet.green_balance < amount:
            raise ValueError(f"Insufficient Green balance ({sender_wallet.green_balance})")
            
        sender_wallet.green_balance -= amount
        receiver_wallet.green_balance += amount
        msg = f"P2P Green Transfer: {amount} units"

    else:
        raise ValueError(f"User type {sender.user_type} cannot initiate transfers")
    
    # Create a block for this transfer
    block = mine_block(db, f"TX: {sender_id} -> {receiver_id} | {msg}")
    
    # Log Transaction
    tx = Transaction(
        sender_id=sender_id, 
        receiver_id=receiver_id, 
        coin_type=CoinType.Green, 
        amount=amount, 
        tx_type=TxType.Transfer, 
        block_id=block.id
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def settle_debt(db: Session, user_id: str, amount: float):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise ValueError("User not found")
        
    wallet = user.wallet
    if user.user_type != "consumer":
        raise ValueError("Only Consumers can settle debt with green coins")
        
    if wallet.green_balance < amount:
        raise ValueError(f"Insufficient Green Coins ({wallet.green_balance})")
    
    if wallet.red_balance < amount:
        raise ValueError(f"Amount exceeds current Red Coin debt ({wallet.red_balance})")
        
    wallet.green_balance -= amount
    wallet.red_balance -= amount
    
    msg = f"Debt Settled: {amount} Green -> {amount} Red"
    block = mine_block(db, f"TX: {user_id} Settles Debt | {msg}")
    
    tx = Transaction(
        sender_id=user_id,
        receiver_id=user_id,
        coin_type=CoinType.Red,
        amount=-amount,
        tx_type=TxType.Transfer,
        block_id=block.id
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
