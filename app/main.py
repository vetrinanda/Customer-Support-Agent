from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.agent import app as agent_app
from pydantic import BaseModel
from app.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI()

# Attach limiter state + error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/chat")
@limiter.limit("5/minute")
def chat(request: Request, query: Query):
    return agent_app.invoke({"query": query.query})