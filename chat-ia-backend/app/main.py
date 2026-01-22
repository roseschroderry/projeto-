from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.config import settings

app = FastAPI(title="Chat IA Backend", version="1.0")

# Configuração CORS - permite requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://projeto-frontend-34e6.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",  # Live Server
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Permite todos os headers
)

@app.on_event("startup")
async def startup_event():
    # Initialize resources if needed
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # Clean up resources if needed
    pass

app.include_router(api_router, prefix=settings.API_PREFIX)