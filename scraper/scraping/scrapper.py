import os
from tavily import TavilyClient
from typing import List, Optional, Dict, Any

def tavily_search(
    query: str,
    search_depth: str = "advanced",
    include_raw_content: bool = True,
    max_results: int = 5,
    include_answer: bool = True,
    include_images: bool = False,
    include_domains: Optional[List[str]] = None,
    exclude_domains: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Performs a search using the Tavily API with advanced options.

    This function is designed to be called with a query, potentially from another LLM,
    and returns detailed search results including raw crawled content.

    Args:
        query (str): The search query.
        search_depth (str, optional): The depth of the search. Can be "basic" or "advanced".
                                     "advanced" provides more in-depth, crawled results. Defaults to "advanced".
        include_raw_content (bool, optional): Whether to include the full raw content of the crawled pages. Defaults to True.
        max_results (int, optional): The maximum number of search results to return. Defaults to 5.
        include_answer (bool, optional): Whether to include a concise answer to the query. Defaults to True.
        include_images (bool, optional): Whether to include image results. Defaults to False.
        include_domains (Optional[List[str]], optional): A list of domains to specifically search within. Defaults to None.
        exclude_domains (Optional[List[str]], optional): A list of domains to exclude from the search. Defaults to None.

    Returns:
        Dict[str, Any]: The search results from the Tavily API.
    """
    try:
        # It's recommended to set TAVILY_API_KEY as an environment variable
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY environment variable not set.")

        tavily = TavilyClient(api_key=api_key)

        # Perform the search with the specified parameters
        response = tavily.search(
            query=query,
            search_depth=search_depth,
            include_raw_content=include_raw_content,
            max_results=max_results,
            include_answer=include_answer,
            include_images=include_images,
            include_domains=include_domains,
            exclude_domains=exclude_domains,
        )
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Example of how to use the function
    # This part will only run when you execute the script directly
    llm_generated_query = "What are the latest advancements in AI for code generation?"
    
    print(f"Performing search for query: '{llm_generated_query}'\n")
    
    search_results = tavily_search(llm_generated_query)
    
    # Print the results in a readable format
    import json
    print(json.dumps(search_results, indent=2))