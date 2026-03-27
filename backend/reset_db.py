from app.db.session import engine, Base

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Tables dropped successfully.")

print("Recreating tables...")
Base.metadata.create_all(bind=engine)
print("Tables recreated successfully.")
