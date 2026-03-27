import os
import sys
import uvicorn
from pyngrok import ngrok
from dotenv import load_dotenv

def start_demo():
    load_dotenv()
    
    # 1. Setup ngrok
    print("\n" + "="*50)
    print("🚀 SUSTAINX INNOVATION CHALLENGE — DEMO RUNNER")
    print("="*50)
    
    try:
        # Open a tunnel on port 8000
        ngrok.set_auth_token("3BXjRyRDJUatgjpDPXdecIJxeSk_4nVJqe5oHkeGmUQV77ZH")
        public_url = ngrok.connect(8000).public_url
        print(f"\n🌍 REMOTE ACCESS ENABLED!")
        print(f"🔗 Public URL: {public_url}")
        print(f"\n⚠️  ACTION REQUIRED:")
        print(f"Update 'frontend/api.ts' ANDROID_HOST with: {public_url.replace('https://', '')}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ ngrok failed: {e}")
        print("💡 Hint: Run 'ngrok config add-authtoken <your_token>' in your terminal.\n")

    # 2. Run Uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start_demo()
