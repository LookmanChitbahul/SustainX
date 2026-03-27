from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import UserType, CoinType, TxType, TxStatus

class MeterReadingBase(BaseModel):
    user_id: str
    import_kwh: float
    export_kwh: float
    billing_cycle: int

class MeterReadingCreate(MeterReadingBase):
    pass

class TransactionBase(BaseModel):
    sender_id: Optional[str]
    receiver_id: str
    coin_type: CoinType
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransferRequest(BaseModel):
    receiver_id: str
    amount: float

class WalletResponse(BaseModel):
    yellow_balance: float
    green_balance: float
    red_balance: float
    last_updated_at: datetime
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    user_id: str
    user_type: UserType
    wallet: Optional[WalletResponse]
    class Config:
        from_attributes = True
