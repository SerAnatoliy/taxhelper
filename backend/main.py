from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from expenses import router as expenses_router


app = FastAPI(title="TaxHelper API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
from auth import router as auth_router
app.include_router(auth_router)
app.include_router(expenses_router)

@app.get("/")
async def root():
    return JSONResponse(content={"message": "TaxHelper Backend Ready!"})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)