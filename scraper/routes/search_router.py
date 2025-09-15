from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import your existing search functions from the 'scraping' directory
from scraping.scrapper import tavily_search
from scraping.use_knowledge_base import query_rag_knowledge_base

# --- Router Initialization ---
router = APIRouter(
    prefix="/search",
    tags=["Search"],
)

# --- Pydantic Models for Request Bodies ---
class WebSearchRequest(BaseModel):
    query: str
    max_results: int = 5

class KBSearchRequest(BaseModel):
    query: str
    topic: str
    max_results: int = 5

# --- API Endpoints ---

@router.post("/web")
async def search_web_endpoint(request: WebSearchRequest):
    """
    Performs a general web search using the Tavily API.
    """
    results = tavily_search(query=request.query, max_results=request.max_results)
    if "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])
    return results

@router.post("/kb")
async def search_kb_endpoint(request: KBSearchRequest):
    """
    Queries a specific RAG knowledge base on Tavily.
    """
    results = query_rag_knowledge_base(query=request.query, topic=request.topic, max_results=request.max_results)
    if "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])
    return results