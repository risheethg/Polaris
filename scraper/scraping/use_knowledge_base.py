import os
import json
from tavily import TavilyClient
from typing import Dict, Any, List, Optional

def query_rag_knowledge_base(
    query: str,
    topic: str,
    search_depth: str = "advanced",
    max_results: int = 5,
    include_domains: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Queries a custom RAG knowledge base on Tavily.

    Args:
        query (str): The search query to run against the knowledge base.
        topic (str): The name of your custom knowledge base on Tavily.
        search_depth (str, optional): The depth of the search. "advanced" is required for RAG.
                                     Defaults to "advanced".
        max_results (int, optional): The maximum number of results to return. Defaults to 5.
        include_domains (Optional[List[str]], optional): A list of domains to specifically search within
                                                        your knowledge base. Defaults to None.

    Returns:
        Dict[str, Any]: The search results from your Tavily RAG knowledge base.
    """
    try:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY environment variable not set.")

        tavily = TavilyClient(api_key=api_key)

        # Use the rag() method to query your custom knowledge base
        response = tavily.rag(
            query=query,
            topic=topic,
            search_depth=search_depth,
            max_results=max_results,
            include_domains=include_domains,
        )
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # --- IMPORTANT ---
    # Replace "your_knowledge_base_name" with the actual name of your knowledge base on Tavily.
    my_knowledge_base_topic = "your_knowledge_base_name"
    my_query = "What is the main product offered on the website?"

    print(f"Querying knowledge base '{my_knowledge_base_topic}' with query: '{my_query}'\n")
    results = query_rag_knowledge_base(query=my_query, topic=my_knowledge_base_topic)

    print(json.dumps(results, indent=2))