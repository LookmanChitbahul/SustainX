from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.model import UserType, CoinType, TxType, TxStatus

class MeterReadingBase(BaseModel):
    user_id: str
    import_kwh: float
    export_kwh: float
    billing_cycle: int

class MeterReadingCreate(MeterReadingBase):
    pass

class TransactionBase(BaseModel):
    sender_id: Optional[str] = None
    receiver_id: str
    coin_type: CoinType
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransferRequest(BaseModel):
    sender_id: str
    receiver_id: str
    amount: float

class WalletResponse(BaseModel):
    yellow_balance: float
    green_balance: float
    red_balance: float
    last_updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    user_id: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    user_type: str
    meter_id: str
    is_admin: bool
    class Config:
        from_attributes = True

class UserWithWallet(BaseModel):
    user_id: str
    user_type: UserType
    meter_id: str
    wallet: Optional[WalletResponse] = None
    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    tx_id: int
    sender_id: Optional[str] = None
    receiver_id: str
    coin_type: CoinType
    amount: float
    tx_type: TxType
    timestamp: datetime
    status: TxStatus
    class Config:
        from_attributes = True

class MarketCycle(BaseModel):
    cycle: int
    supply: float
    demand: float
    price: float

class MarketPrediction(BaseModel):
    cycle: int
    predicted_price: float
    predicted_supply: float
    predicted_demand: float
    is_prediction: bool

class MarketResponse(BaseModel):
    history: List[MarketCycle]
    predictions: List[MarketPrediction]
    supply_confidence: float
    demand_confidence: float
    current_price: float
    price_trend: str
