import json
import time
import random
import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import vertexai
from vertexai.generative_models import GenerativeModel
from scripts import config

# --- SETUP ---
def get_driver():
    """Setup Headless Chrome for Cloud Run / Local"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    # Random User Agent to look human
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    # Check if running in Docker (usually /usr/bin/chromedriver) or Local
    if os.path.exists("/usr/bin/chromedriver"):
        service = Service("/usr/bin/chromedriver")
    else:
        service = Service(ChromeDriverManager().install())
        
    return webdriver.Chrome(service=service, options=chrome_options)

# --- MODULE 1: COMPANY RATINGS (AmbitionBox) ---
def scrape_company_rating(driver, company_name):
    """
    Searches AmbitionBox for the company and grabs the rating.
    """
    if not company_name:
        return "Unknown"
        
    print(f"   ⭐ Checking ratings for: {company_name}...")
    try:
        # Construct search URL (Simple guess)
        query = urllib.parse.quote(company_name)
        search_url = f"https://www.ambitionbox.com/overview/{query}-overview"
        
        driver.get(search_url)
        time.sleep(2) # Wait for load

        # Try to find the main rating badge (CSS selectors change, using generic class)
        # AmbitionBox usually puts the rating in a box with a star
        try:
            rating_element = driver.find_element(By.CSS_SELECTOR, "span.rating-badge")
            rating = rating_element.text.strip()
            return rating
        except:
            # Fallback: Try searching via Google if direct link failed (simplified for now)
            return "Not Found"
            
    except Exception as e:
        print(f"   ⚠️ Rating scrape failed: {e}")
        return "Unknown"

# --- MODULE 2: LLM PARSER (Vertex AI) ---
def parse_with_gemini(raw_text, company_rating):
    """
    Uses Gemini to clean the raw HTML text into your specific JSON schema.
    """
    vertexai.init(project=config.PROJECT_ID, location=config.REGION)
    model = GenerativeModel("gemini-1.5-flash")
    
    # We inject the scraped rating into the prompt so Gemini adds it to the JSON
    prompt = f"""
    You are a data extractor. Convert the raw job text below into strict JSON.
    
    Data to Inject:
    - Company Rating: {company_rating}

    Required JSON Schema:
    {{
        "title": "Job Title",
        "company": "Company Name",
        "description": "Full Summary",
        "required_skills": {{
            "technical": ["list", "of", "tech", "skills"],
            "soft": ["list", "of", "soft", "skills"]
        }},
        "experience_required": "e.g. 2-4 years",
        "avg_salary": {{ "value": 0, "currency": "INR", "period": "annum" }},
        "work_life_balance": "Infer from text/rating (High/Moderate/Low)",
        "work_pressure": "Infer from text (High/Moderate/Low)",
        "side_hobbies": ["Infer 3 likely hobbies for this persona"]
    }}

    Raw Text:
    {raw_text[:8000]}
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean markdown code blocks
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"   ❌ LLM Error: {e}")
        return None

# --- MODULE 3: THE AGGREGATOR SCRAPER ---
def run_scraper():
    print("🕷️ [Scraper] Starting Google Job Aggregator...")
    driver = get_driver()
    jobs_data = []

    try:
        # 1. THE SEARCH URL
        # 'ibp=htl;jobs' forces the "Job Search" interface
        # You can change 'python+developer' and 'bangalore' dynamically
        base_url = "https://www.google.com/search?q=python+developer+jobs+in+bangalore&ibp=htl;jobs"
        driver.get(base_url)
        time.sleep(4) 
        
        # 2. SCROLLING (To load more jobs)
        # The job list is inside a scrollable pane. We need to find it and scroll.
        try:
            # This class usually targets the left-hand job list pane
            pane = driver.find_element(By.CSS_SELECTOR, '.gws-plugins-horizon-jobs__js-list')
            for _ in range(3): # Scroll down 3 times
                driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", pane)
                time.sleep(1)
        except:
            print("   ⚠️ Could not auto-scroll (ignoring).")

        # 3. FIND JOB CARDS
        # Google uses 'li' elements for the list items in this view
        job_cards = driver.find_elements(By.CSS_SELECTOR, "li")
        
        print(f"   Found {len(job_cards)} potential jobs. Processing top 5...")

        for card in job_cards[:5]: 
            try:
                # Click the card to load details on the right pane
                card.click()
                time.sleep(random.uniform(1.5, 3)) # Wait for right pane to load
                
                # EXTRACT COMPANY NAME (For AmbitionBox)
                # Usually in a div with specific formatting, but we'll grab it from text lines
                # text usually looks like: "Senior Dev \n Google \n Bangalore"
                card_text = card.text.split('\n')
                if len(card_text) > 1:
                    company_name = card_text[1] # Naive extraction
                else:
                    company_name = "Unknown"

                # EXTRACT DESCRIPTION
                # The details pane typically has an ID like 'gws-plugins-horizon-jobs__job_details_page'
                # We simply grab the biggest block of text on the page that isn't the list
                details_pane = driver.find_element(By.ID, "gws-plugins-horizon-jobs__job_details_page")
                raw_text = details_pane.text
                
                # --- ENRICHMENT PIPELINE ---
                
                # A. Get Rating (AmbitionBox)
                # Note: This might slow down scraping. 
                # Optimization: Do this *after* scraping all jobs, in a separate batch.
                rating = "Unknown" 
                rating = scrape_company_rating(driver, company_name) # Uncomment to enable

                # B. Clean with LLM
                clean_data = parse_with_gemini(raw_text, rating)
                
                if clean_data:
                    # Ensure title/company are correct (LLM is better at extraction than us)
                    if clean_data.get('company') == 'Company Name': 
                        clean_data['company'] = company_name
                        
                    jobs_data.append(clean_data)
                    print(f"   ✅ Scraped: {clean_data.get('title')} at {clean_data.get('company')}")
                
            except Exception as e:
                # Typical error: StaleElementReference (DOM changed while scraping)
                pass

    finally:
        driver.quit()

    return jobs_data

if __name__ == "__main__":
    # Test run
    results = run_scraper()
    print(json.dumps(results, indent=2))