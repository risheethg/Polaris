import os
import json
import google.generativeai as genai
from scraping.scrapper import tavily_search

def get_gemini_response(prompt: str) -> str:
    """
    Sends a prompt to the Gemini API and returns the text response.

    Args:
        prompt (str): The prompt to send to Gemini.

    Returns:
        str: The text part of the Gemini response.
    """
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text

def analyze_job_role(job_title: str) -> dict:
    """
    Orchestrates the process of searching for job role information and analyzing it with Gemini.

    1. Generates a search query for a given job role.
    2. Uses Tavily to get search results.
    3. Sends the results to Gemini for analysis and JSON generation.
    4. Saves the resulting JSON to a file.

    Args:
        job_title (str): The job title to analyze (e.g., "Software Engineer").

    Returns:
        dict: The final JSON data with job role ratings.
    """
    print(f"--- Starting analysis for: {job_title} ---")

    # 1. Use Gemini to generate a targeted search query
    query_generation_prompt = f"Generate a concise and effective search query to find information about the typical work-life balance, salary expectations, and career growth for a '{job_title}' role. The query should be suitable for a web search engine."
    print("1. Generating search query with Gemini...")
    search_query = get_gemini_response(query_generation_prompt).strip().replace('"', '')
    print(f"   Generated Query: {search_query}")

    # 2. Call Tavily search with the generated query
    print("\n2. Searching with Tavily...")
    search_results = tavily_search(query=search_query, max_results=5)
    
    if "error" in search_results or not search_results.get("results"):
        print("   Could not retrieve search results. Aborting.")
        return {"error": "Failed to get search results from Tavily."}

    # 3. Consolidate raw content and send to Gemini for analysis
    print("\n3. Analyzing content with Gemini...")
    raw_content_list = [res.get("raw_content", "") for res in search_results["results"] if res.get("raw_content")]
    consolidated_content = "\n\n---\n\n".join(raw_content_list)

    if not consolidated_content.strip():
        print("   No raw content found in search results to analyze. Aborting.")
        return {"error": "No raw content available for analysis."}

    analysis_prompt = f"""
    Based on the following text which contains articles, reviews, and salary data about the job role '{job_title}', please analyze the content and return a JSON object.

    The JSON object should rate the following parameters on a scale of 1 to 5, where 1 is very poor and 5 is excellent.
    - "work_life_balance"
    - "salary_and_benefits"
    - "career_growth"
    - "job_security"
    - "company_culture"

    If there is not enough information to rate a parameter, use a value of null.
    Only return the raw JSON object and nothing else.

    Here is the content to analyze:
    ---
    {consolidated_content}
    ---
    """
    json_string = get_gemini_response(analysis_prompt)
    
    # Clean up the response to ensure it's valid JSON
    cleaned_json_string = json_string.strip().lstrip("```json").rstrip("```")
    final_json_data = json.loads(cleaned_json_string)

    # 4. Save the JSON data to a file
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"{job_title.lower().replace(' ', '_')}_analysis.json")
    
    print(f"\n4. Saving analysis to {file_path}")
    with open(file_path, 'w') as f:
        json.dump(final_json_data, f, indent=4)
    
    print("\n--- Analysis Complete ---")
    return final_json_data

if __name__ == "__main__":
    # Configure the Gemini API key
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=google_api_key)

    # --- Example Usage ---
    # Replace "Software Engineer" with any job role you want to analyze
    job_to_analyze = "Software Engineer"
    analysis_result = analyze_job_role(job_to_analyze)
    
    print("\nFinal JSON Output:")
    print(json.dumps(analysis_result, indent=2))