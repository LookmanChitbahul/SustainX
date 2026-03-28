from app.db.session import SessionLocal
from app.models.model import User

def fix_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            user.password = "12345678"
        db.commit()
        print(f"SUCCESS: Updated {len(users)} users to password '12345678'")
    except Exception as e:
        import traceback
        print(f"ERROR: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_passwords()
