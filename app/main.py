from langgraph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenAI
from typing import TypedDict,Dict
from langchain_core.runnables.graph import MermaidDrawMethod
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import os
load_dotenv()
class State(TypedDict):
    query:str
    category:str
    sentiment:str
    response:str
parser=StrOutputParser()
llm=GoogleGenAI(model_name="gemini-3.0-flash-preview",api_key=os.getenv("GOOGLE_API_KEY"))

def categorize(state:State) -> State:
    '''
    Categorize the query into a category
    Technical, Billing, General
    '''
    prompt = ChatPromptTemplate.from_template("""
    You are a customer support agent. Categorize the query into a category
    Technical, Billing, General. Query: {query}
    """)
    chain=prompt | llm | parser
    return {"category":chain.invoke({"query":state["query"]})}  



