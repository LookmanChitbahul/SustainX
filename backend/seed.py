import pandas as pd
from database import SessionLocal, engine
from models import Base, User, Wallet, MeterReading
import os

# Create DB schema
print("Ensuring database tables exist...")
Base.metadata.create_all(bind=engine)

print("Reading Excel file...")
file_path = '../ref/8. sustainx_final_dataset.xlsx'
if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

df = pd.read_excel(file_path)

db = SessionLocal()

try:
    print("Seeding Users and Wallets...")
    # Seed unique users
    for _, row in df.drop_duplicates(subset=['user_id']).iterrows():
        user = db.query(User).filter(User.user_id == row['user_id']).first()
        if not user:
            user = User(
                user_id=row['user_id'],
                user_type=row['user_type'],
                meter_id=row['meter_id']
            )
            db.add(user)
            db.commit()
            
            # Create corresponding empty wallet
            wallet = Wallet(user_id=user.user_id)
            db.add(wallet)
            db.commit()

    print("Seeding Meter Readings...")
    # Seed readings
    for _, row in df.iterrows():
        # Check if reading for this cycle exists to prevent duplicates
        existing = db.query(MeterReading).filter(
            MeterReading.user_id == row['user_id'],
            MeterReading.billing_cycle == row['billing_cycle']
        ).first()
        
        if not existing:
            reading = MeterReading(
                user_id=row['user_id'],
                import_kwh=row['import_kwh'],
                export_kwh=row['export_kwh'],
                billing_cycle=row['billing_cycle'],
                processed=False
            )
            db.add(reading)
    db.commit()
    print("Database seeding completed successfully!")

except Exception as e:
    print(f"Error during seeding: {e}")
    db.rollback()
finally:
    db.close()
