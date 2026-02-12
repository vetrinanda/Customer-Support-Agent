from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
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
llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=os.getenv("GOOGLE_API_KEY"))

def categorize(state:State) -> State:
    '''
    Categorize the query into a category
    Technical, Billing, General
    '''
    prompt = ChatPromptTemplate.from_template("""
    You are a customer support agent. Categorize the query into a category
    'Technical', 'Billing', 'General'. Query: {query}
    """)
    chain=prompt | llm
    return {"category":chain.invoke({"query":state["query"]}).content}  


def analyse_sentiment(state:State) -> State:
    '''
    Detect the sentiment of the query
    Positive, Negative, Neutral
    '''
    prompt = ChatPromptTemplate.from_template("""
    Analyse the following customer query and detect the sentiment of the query, response with either
    'Positive', 'Negative','Neutral'. Query: {query}
    """)
    sentiment=prompt | llm 
    return {"sentiment":sentiment.invoke({"query":state["query"]}).content} 


def handle_technical(state:State) -> State:
    '''
    Handle technical queries
    '''
    prompt = ChatPromptTemplate.from_template("""
    Provide a tecnical support response to the following query. Query: {query}
    """)
    technical=prompt | llm
    return {"response":technical.invoke({"query":state["query"]}).content}  

def handle_billing(state:State) -> State:
    '''
    Handle billing queries
    '''
    prompt = ChatPromptTemplate.from_template("""
    Provide a billing support response to the following query. Query: {query}
    """)
    technical=prompt | llm 
    return {"response":technical.invoke({"query":state["query"]}).content} 


def handle_general(state:State) -> State:
    '''
    Handle general queries
    '''
    prompt = ChatPromptTemplate.from_template("""
    Provide a general support response to the following query. Query: {query}
    """)
    general=prompt | llm 
    return {"response":general.invoke({"query":state["query"]}).content} 


def escalate(state:State) -> State:
    '''
    Escalate the query to a human agent
    '''
    return {"response":"Escalated to human agent"} 



def route(state:State) -> str:
    '''
    Route the query to the appropriate handler
    '''
    if state["sentiment"] == "Negative":
        return "escalate"
    elif state["category"] == "Technical":
        return "handle_technical"
    elif state["category"] == "Billing":
        return "handle_billing"
    else:
        return "handle_general"


workflow=StateGraph(State)
workflow.add_node("categorize",categorize)
workflow.add_node("analyse_sentiment",analyse_sentiment)
workflow.add_node("handle_technical",handle_technical)
workflow.add_node("handle_billing",handle_billing)
workflow.add_node("handle_general",handle_general)
workflow.add_node("escalate",escalate)

workflow.set_entry_point("categorize")
workflow.add_edge("categorize","analyse_sentiment")
workflow.add_conditional_edges("analyse_sentiment", route, {
    "handle_technical": "handle_technical",
    "handle_billing": "handle_billing",
    "handle_general": "handle_general",
    "escalate": "escalate"
})
workflow.add_edge("handle_technical",END)
workflow.add_edge("handle_billing",END)
workflow.add_edge("handle_general",END)
workflow.add_edge("escalate",END)

app=workflow.compile()


# if __name__ == "__main__":
#     print(app.invoke({"query":"I am facing an issue with my internet connection"}))

