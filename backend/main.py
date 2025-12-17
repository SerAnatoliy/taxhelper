from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from expenses import router as expenses_router
import stripe
import os
from dotenv import load_dotenv
from bank import router as bank_router
from veriff import router as veriff_router

app = FastAPI(title="TaxHelper API", version="0.1.0")
load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from auth import router as auth_router
app.include_router(auth_router)
app.include_router(expenses_router)
app.include_router(bank_router)
app.include_router(veriff_router)

@app.get("/")
async def root():
    return JSONResponse(content={"message": "TaxHelper Backend Ready!"})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)