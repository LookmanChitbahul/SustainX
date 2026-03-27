import uvicorn
from fastapi import FastAPI, Request, Response
import httpx
from pyngrok import ngrok
from dotenv import load_dotenv

app = FastAPI()
client = httpx.AsyncClient()

BACKEND_URL = "http://localhost:8000"
METRO_URL = "http://localhost:8082" # Using the port where Metro is currently running

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def proxy(request: Request, path: str):
    url = f"{BACKEND_URL}/api/{path}" if path.startswith("api/") or path.startswith("login") else f"{METRO_URL}/{path}"
    
    # Simple routing logic: if it's an API call, go to backend. Otherwise, Metro.
    target_url = f"{BACKEND_URL}/{path}" if path.startswith("api") else f"{METRO_URL}/{path}"

    headers = dict(request.headers)
    headers.pop("host", None) # Important for proxying

    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=await request.body(),
            params=request.query_params,
            follow_redirects=True
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except Exception as e:
        return Response(content=f"Proxy Error: {str(e)}", status_code=502)

def start_mega_tunnel():
    load_dotenv()
    ngrok.set_auth_token("3BXjRyRDJUatgjpDPXdecIJxeSk_4nVJqe5oHkeGmUQV77ZH")
    
    # Kill existing tunnels to avoid ERR_NGROK_334
    for t in ngrok.get_tunnels():
        ngrok.disconnect(t.public_url)
        
    public_url = ngrok.connect(5000).public_url
    print("\n" + "!"*50)
    print("🚀 UNIFIED MEGA-TUNNEL (BACKEND + METRO) IS LIVE!")
    print(f"🔗 Public URL: {public_url}")
    print(f"📱 Scan this in Expo Go: exp://{public_url.replace('https://', '')}")
    print("!"*50 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=5000)

if __name__ == "__main__":
    start_mega_tunnel()
