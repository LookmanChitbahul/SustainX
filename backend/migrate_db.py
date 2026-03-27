import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load database configuration
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sustainx.db")

def run_migration():
    print(f"Connecting to {DATABASE_URL}...")
    engine = create_engine(DATABASE_URL)
    
    # Ensure new tables (like 'blocks') are created first
    from app.models.model import Base
    print("Ensuring all tables exist...")
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        print("Adding 'block_id' column to 'transactions' table...")
        try:
            # PostgreSQL syntax for adding a column with a foreign key
            if "postgresql" in DATABASE_URL:
                # We use try/except as PostgreSQL's ADD COLUMN IF NOT EXISTS requires careful handling
                # and ADD CONSTRAINT also might fail if already existing.
                conn.execute(text("ALTER TABLE transactions ADD COLUMN block_id INTEGER;"))
                conn.execute(text("ALTER TABLE transactions ADD CONSTRAINT fk_block FOREIGN KEY (block_id) REFERENCES blocks(id);"))
                print("Column 'block_id' added successfully to PostgreSQL.")
            else:
                # SQLite doesn't support adding constraints easily
                conn.execute(text("ALTER TABLE transactions ADD COLUMN block_id INTEGER REFERENCES blocks(id);"))
                print("Column 'block_id' added successfully to SQLite.")
        except Exception as e:
            print(f"Migration note: {e}")
            print("The column might already exist.")
            
        conn.commit()
    print("Migration complete!")

if __name__ == "__main__":
    run_migration()
