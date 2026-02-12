from fastapi import FastAPI
from app.agent import app 
from pydantic import BaseModel

app=FastAPI()

class Query(BaseModel):
    query:str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/chat")
def chat(query:Query):
    return app.invoke({"query":query.query})
   