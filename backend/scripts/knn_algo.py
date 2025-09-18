import pandas as pd
import json
import os
import warnings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.cluster import KMeans
import numpy as np

# Ignore the KMeans convergence warning 
warnings.filterwarnings("ignore", category=UserWarning)

# Load from a JSON File
def load_job_data_from_file(file_path: str = 'scrapped_job.json') -> list:
    """
    Loads job data from a single specified JSON file.
    
    Args:
        file_path (str): The path to the JSON file containing the job data.

    Returns:
        list: A list of dictionaries, where each dictionary is a job entry.
              Returns an empty list if the file is not found or is invalid.
    """
    if not os.path.exists(file_path):
        print(f"Error: The file '{file_path}' was not found. Please ensure it exists.")
        return []
        
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            else:
                print(f"Error: Expected a JSON list of objects in '{file_path}', but found a different format.")
                return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from file: {file_path}.")
        print(e)
        return []

jobs_json_list = load_job_data_from_file()

if not jobs_json_list:
    print("Aborting clustering. No valid job data found.")
else:
    jobs_df = pd.DataFrame(jobs_json_list)

    # Preprocessing & Vectorization
    def get_skills_text(skills):
        if isinstance(skills, list):
            return ' '.join(skills)
        elif isinstance(skills, dict):
            technical_skills = ' '.join(skills.get('technical', []))
            soft_skills = ' '.join(skills.get('soft', []))
            return f"{technical_skills} {soft_skills}"
        return ""

    jobs_df['all_text'] = jobs_df['title'] + ' ' + jobs_df['description'] + ' ' + jobs_df['required_skills'].apply(get_skills_text)
    
    experience_map = {"0-2 years": 1, "1-3 years": 2, "2-4 years": 3, "3-5 years": 4, "0-1 year": 1, "5+ years": 5}
    jobs_df['experience_num'] = jobs_df['experience_required'].map(experience_map)

    jobs_df.dropna(subset=['experience_num'], inplace=True)
    
    # Define the columns and their respective transformers
    preprocessor = ColumnTransformer(
        transformers=[
            ('text_vectorizer', TfidfVectorizer(stop_words='english'), 'all_text'),
            ('one_hot_encoder', OneHotEncoder(), ['industry']),
            ('experience_num_passthrough', 'passthrough', ['experience_num'])
        ],
        remainder='drop'
    )
    
    n_clusters = 4
    
    if len(jobs_df) < n_clusters:
        print(f"Cannot run KMeans with {n_clusters} clusters. Need at least {n_clusters} samples. Only found {len(jobs_df)}.")
    else:
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('clusterer', KMeans(n_clusters=n_clusters, random_state=42, n_init='auto'))
        ])
        
        # K-Means Clustering
        pipeline.fit(jobs_df)
        jobs_df['cluster_label'] = pipeline.named_steps['clusterer'].labels_
        
        # Finding Top Keywords 
        tfidf_vectorizer = pipeline.named_steps['preprocessor'].named_transformers_['text_vectorizer']
        tfidf_feature_names = tfidf_vectorizer.get_feature_names_out()
        cluster_centers = pipeline.named_steps['clusterer'].cluster_centers_
        top_n_words = 5

        print("\n Interpreting Cluster Topics ")
        for i, center in enumerate(cluster_centers):
            tfidf_weights = center[:len(tfidf_feature_names)]
            top_feature_indices = tfidf_weights.argsort()[-top_n_words:][::-1]
            top_words = [tfidf_feature_names[j] for j in top_feature_indices]

            print(f"\nCluster {i} Topic: {', '.join(top_words)}")
            print(f"Jobs in this cluster: {', '.join(jobs_df[jobs_df['cluster_label'] == i]['title'].tolist())}")