import os
import subprocess
import time
import sys

def start_demo():
    print("\n" + "="*50)
    print("🚀 SUSTAINX INNOVATION CHALLENGE — STABLE DEMO RUNNER")
    print("="*50)
    print("💡 Switching to LocalTunnel to avoid Ngrok session conflicts with Expo.")
    
    # 1. Start LocalTunnel in a separate process
    # We use npx to ensure localtunnel is available
    print("\n🌍 STARTING REMOTE ACCESS TUNNEL...")
    lt_proc = subprocess.Popen(
        ["npx", "localtunnel", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=True
    )
    
    # Give it a moment to generate the URL
    time.sleep(3)
    
    print("\n⚠️  ACTION REQUIRED:")
    print("1. Find your 'your url is: ...' line below.")
    print("2. Copy the hostname (e.g., 'funny-cats-jump.loca.lt').")
    print("3. Update 'frontend/api.ts' -> ANDROID_HOST with this value.")
    print("="*50 + "\n")
    
    # 2. Run Uvicorn in the main thread
    try:
        import uvicorn
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nStopping demo...")
    finally:
        lt_proc.terminate()

if __name__ == "__main__":
    start_demo()
