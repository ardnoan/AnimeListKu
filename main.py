from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://api.jikan.moe/v4"

@app.get("/top-anime")
async def get_top_anime(page: int = 1):
    try:
        response = requests.get(f"{BASE_URL}/top/anime", params={"page": page})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch top anime")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommendations")
async def get_recommendations():
    try:
        response = requests.get(f"{BASE_URL}/recommendations/anime")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch recommendations")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/genres")
async def get_genres():
    try:
        response = requests.get(f"{BASE_URL}/genres/anime")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch genres")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/anime")
async def get_anime(q: Optional[str] = None, page: int = 1):
    try:
        url = f"{BASE_URL}/anime"
        params = {"page": page}
        if q:
            url += f"/{q}"
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch anime list")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
