from langgraph import StateGraph, StateNode, Edge
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import GoogleGenAI


# Define the prompt template for the LLM
prompt_template = PromptTemplate(
    input_variables=["customer_name", "issue"],
    template="Hello {customer_name}, I'm here to help with your issue: {issue}. What can I do for you today?"
)

llm = GoogleGenAI(model="gpt-4")