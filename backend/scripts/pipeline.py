from scripts import scraper, preprocess, train, config

def main():
    print(f"🚀 [Pipeline] Starting Job Enrichment Pipeline for project: {config.PROJECT_ID}")
    
    # Step 1: Scrape new data
    # Returns: List of dicts (Clean JSON from Gemini)
    new_jobs = scraper.run_scraper()
    
    if not new_jobs:
        print("⚠️ No new jobs found. Pipeline stopping.")
        # Optional: Continue anyway to re-train on old data?
        # For now, let's stop.
        # return 
    
    # Step 2: Preprocess (Merge Old + New -> Vectorize -> PCA)
    # Returns: merged_jobs (list of dicts with 'reduced_vector'), pca_vectors (numpy)
    all_jobs, _ = preprocess.run_preprocess(new_jobs)
    
    if not all_jobs:
        print("⚠️ Data processing failed.")
        return

    # Step 3: Train (K-Means on reduced_vectors + RIASEC)
    # Logic: Takes the enriched list, stacks vectors, trains model, saves everything.
    train.run_training(all_jobs)
    
    print("🎉 [Pipeline] Execution Finished Successfully.")

if __name__ == "__main__":
    main()