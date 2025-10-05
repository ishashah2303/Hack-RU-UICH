from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import TypedDict
from dotenv import load_dotenv
import requests

load_dotenv()

model = ChatGoogleGenerativeAI(model="gemini-2.5-pro")

class ClassesSchema(BaseModel):
    classes: list[str] = Field(..., description="Category of the query from the following - check_library_hours, order_food, get_events, check_bus_schedule, get_directions, set_reminder, get_weather")


structured_model = model.with_structured_output(ClassesSchema)

class StudentLifeState(TypedDict):
    query: str
    classes: list[str]
    api_results: dict[str, str]
    response: str

def identify_task(state: StudentLifeState) -> StudentLifeState:
    classes_identified = structured_model.invoke(
        f"Identify the category of the following student life related query and the APIs to be called to get information. Query: {state['query']}"
    )
    return {
        "classes": classes_identified.classes
    }

def call_apis(state: StudentLifeState) -> StudentLifeState:
    results = {}
    for api in state["classes"]:
        # Mock API call
        res = requests.get(f"http://localhost:8000/{api}").json()
        results[api] = res
    return {
        "api_results": results
    }


def generate_response(state: StudentLifeState) -> StudentLifeState:
    prompt = f"""
    You are an intelligent assistant of Rutgers University - New Brunswick. A user asked the following query:

    {state['query']}

    You have received API results for these classes: {state['classes']}

    Use these ideas to find answer to the query:
    {state['api_results']}

    Please answer the user's query using the information from the API results. 
    - If the api result asks for weather prediction, then predict the weather based on the location.
    - Try to do your own search in web to get specific answer in more detail.
    - If multiple classes have relevant data, integrate it into a coherent answer.
    - If no relevant information is found, politely indicate that you cannot find an answer.
    - Keep the response concise and informative.
    """

    reply = model.invoke(prompt)
    state["response"] = reply.content
    return state


graph = StateGraph(StudentLifeState)

graph.add_node("identify_task", identify_task)
graph.add_node("call_apis", call_apis)
graph.add_node("generate_response", generate_response)

graph.add_edge(START, "identify_task")
graph.add_edge("identify_task", "call_apis")
graph.add_edge("call_apis", "generate_response")
graph.add_edge("generate_response", END)

workflow = graph.compile()
