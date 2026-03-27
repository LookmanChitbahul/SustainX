from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base

class UserType(str, enum.Enum):
    prosumer = "prosumer"
    consumer = "consumer"

class CoinType(str, enum.Enum):
    Yellow = "Yellow"
    Green = "Green"
    Red = "Red"

class TxType(str, enum.Enum):
    Generation = "Generation"
    Transfer = "Transfer"
    Consumption = "Consumption"

class TxStatus(str, enum.Enum):
    Completed = "Completed"
    Failed = "Failed"
    Reverted = "Reverted"

class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True, index=True)
    user_type = Column(String) # 'prosumer' or 'consumer'
    meter_id = Column(String, unique=True, index=True)
    password = Column(String, default="12345678")
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    meter_readings = relationship("MeterReading", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)

class Wallet(Base):
    __tablename__ = "wallets"
    wallet_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), unique=True)
    yellow_balance = Column(Float, default=0.0)
    green_balance = Column(Float, default=0.0)
    red_balance = Column(Float, default=0.0)
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")

class MeterReading(Base):
    __tablename__ = "meter_readings"
    reading_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    import_kwh = Column(Float)
    export_kwh = Column(Float)
    billing_cycle = Column(Integer)
    processed = Column(Boolean, default=False)

    user = relationship("User", back_populates="meter_readings")

class Transaction(Base):
    __tablename__ = "transactions"
    tx_id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("users.user_id"), nullable=True)
    receiver_id = Column(String, ForeignKey("users.user_id"))
    coin_type = Column(Enum(CoinType))
    amount = Column(Float)
    tx_type = Column(Enum(TxType))
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(TxStatus), default=TxStatus.Completed)
