#!/usr/bin/env python3
"""
Fix the merge key mismatch between features and closing ranks datasets
"""
import pandas as pd
import numpy as np
from collections import Counter

def analyze_key_columns():
    """Analyze the key columns in both datasets to understand the mismatch"""
    print("=== ANALYZING KEY COLUMN MISMATCHES ===")
    
    # Load both datasets
    print("Loading datasets...")
    features_df = pd.read_csv('neet_pg_features.csv')
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    
    print(f"Features dataset shape: {features_df.shape}")
    print(f"Closing ranks dataset shape: {ranks_df.shape}")
    
    # Analyze Institute column
    print("\n--- INSTITUTE COLUMN ---")
    features_institutes = set(features_df['Institute'].unique())
    ranks_institutes = set(ranks_df['Institute'].unique())
    
    print(f"Features institutes count: {len(features_institutes)}")
    print(f"Ranks institutes count: {len(ranks_institutes)}")
    print(f"Common institutes: {len(features_institutes.intersection(ranks_institutes))}")
    
    # Show some examples
    print("\nFirst 5 institutes in features:")
    for inst in list(features_institutes)[:5]:
        print(f"  '{inst}'")
    
    print("\nFirst 5 institutes in ranks:")
    for inst in list(ranks_institutes)[:5]:
        print(f"  '{inst}'")
    
    # Analyze Category column
    print("\n--- CATEGORY COLUMN ---")
    features_categories = Counter(features_df['Category'])
    ranks_categories = Counter(ranks_df['Category'])
    
    print(f"Features categories: {dict(features_categories)}")
    print(f"Ranks categories: {dict(ranks_categories)}")
    
    # Analyze Quota column
    print("\n--- QUOTA COLUMN ---")
    features_quotas = Counter(features_df['Quota'])
    ranks_quotas = Counter(ranks_df['Quota'])
    
    print(f"Features quotas: {dict(features_quotas)}")
    print(f"Ranks quotas (top 10): {dict(ranks_quotas.most_common(10))}")
    
    # Analyze Course column
    print("\n--- COURSE COLUMN ---")
    features_courses = set(features_df['Course'].unique())
    ranks_courses = set(ranks_df['Course'].unique())
    
    print(f"Features courses count: {len(features_courses)}")
    print(f"Ranks courses count: {len(ranks_courses)}")
    print(f"Common courses: {len(features_courses.intersection(ranks_courses))}")
    
    return features_df, ranks_df

def create_mapping_tables(features_df, ranks_df):
    """Create mapping tables to align the key columns"""
    print("\n=== CREATING MAPPING TABLES ===")
    
    # Create original data mapping from raw dataset
    print("Loading original dataset for mapping...")
    original_df = pd.read_csv('Neet-PG.csv')
    
    # Create category mapping
    category_mapping = {}
    
    # Extract unique combinations from original data
    original_combinations = []
    for col in original_df.columns:
        if col.startswith('CR '):  # Closing rank columns
            continue
        # Look for category-related columns
        if any(cat in col.lower() for cat in ['category', 'quota']):
            print(f"Found potential key column: {col}")
    
    # Look at actual original data structure
    print("\nOriginal dataset columns:")
    for i, col in enumerate(original_df.columns):
        print(f"{i:2}: {col}")
    
    print(f"\nOriginal dataset shape: {original_df.shape}")
    
    # Examine specific rows to understand the mapping
    sample_original = original_df.head(10)
    sample_ranks = ranks_df.head(10)
    
    print("\nSample original data (key columns):")
    key_cols = ['Institute', 'Course', 'Quota', 'Category', 'State']
    for col in key_cols:
        if col in original_df.columns:
            print(f"{col}: {original_df[col].head(3).tolist()}")
    
    return original_df

def fix_feature_dataset():
    """Fix the feature dataset to maintain proper granularity for merging"""
    print("\n=== FIXING FEATURE DATASET ===")
    
    # Load original cleaned data
    original_df = pd.read_csv('neet_pg_cleaned.csv')
    print(f"Original cleaned dataset shape: {original_df.shape}")
    
    # Check what columns are available
    print("Available columns in cleaned dataset:")
    for i, col in enumerate(original_df.columns):
        print(f"{i:2}: {col}")
    
    # Load closing ranks to see what we need to match
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    
    # Create proper feature combinations that match closing ranks
    print("\nCreating feature combinations that match closing ranks...")
    
    # Get unique combinations from closing ranks
    rank_combinations = ranks_df[['Institute', 'Course', 'Quota', 'Category', 'State']].drop_duplicates()
    print(f"Unique combinations in closing ranks: {len(rank_combinations)}")
    
    # Merge with original cleaned data to get features
    print("Merging with original cleaned data...")
    
    # First, let's see what the merge keys look like
    print("\nSample rank combinations:")
    print(rank_combinations.head())
    
    print("\nSample original cleaned data:")
    print(original_df[['Institute', 'Course', 'Quota', 'Category', 'State']].head())
    
    # Try the merge
    merged_features = rank_combinations.merge(
        original_df,
        on=['Institute', 'Course', 'Quota', 'Category', 'State'],
        how='left'
    )
    
    print(f"Merged features shape: {merged_features.shape}")
    print(f"Non-null matches: {merged_features.dropna().shape[0]}")
    
    if merged_features.dropna().shape[0] == 0:
        print("\nNo matches found! The cleaning process changed the key values.")
        print("Need to recreate features from original data with proper key preservation.")
        
        # Load original raw data
        raw_df = pd.read_csv('Neet-PG.csv')
        
        # Create features directly for rank combinations
        print("Creating features directly from raw data...")
        
        # Add basic features to rank combinations
        enhanced_features = rank_combinations.copy()
        
        # Merge with raw data to get financial and structural info
        # First, let's understand the raw data structure
        print("\nRaw data sample:")
        print(raw_df.head(2))
        
        # Create a mapping from raw data
        raw_sample = raw_df[['Institute', 'Course', 'Quota', 'Category', 'State', 
                            'Type of Course', 'Bond Years', 'Bond Penalty', 'Fee', 
                            'Stipend Year 1', 'Beds']].drop_duplicates()
        
        print(f"Raw sample unique combinations: {len(raw_sample)}")
        
        # Merge to get basic features
        enhanced_features = enhanced_features.merge(
            raw_sample,
            on=['Institute', 'Course', 'Quota', 'Category', 'State'],
            how='left'
        )
        
        print(f"Enhanced features shape: {enhanced_features.shape}")
        print(f"Non-null enhanced features: {enhanced_features.dropna(subset=['Type of Course']).shape[0]}")
        
        return enhanced_features
    
    return merged_features

if __name__ == "__main__":
    # Analyze the mismatch
    features_df, ranks_df = analyze_key_columns()
    
    # Create mapping tables
    original_df = create_mapping_tables(features_df, ranks_df)
    
    # Fix the feature dataset
    fixed_features = fix_feature_dataset()
    
    if fixed_features is not None:
        print(f"\nFixed features dataset shape: {fixed_features.shape}")
        
        # Save the fixed features
        print("Saving fixed features dataset...")
        fixed_features.to_csv('neet_pg_features_fixed.csv', index=False)
        print("Saved as 'neet_pg_features_fixed.csv'")
        
        # Test the merge
        print("\nTesting merge with closing ranks...")
        test_merge = fixed_features.merge(
            ranks_df,
            on=['Institute', 'Course', 'Quota', 'Category', 'State'],
            how='inner'
        )
        
        print(f"Test merge shape: {test_merge.shape}")
        if test_merge.shape[0] > 0:
            print("✓ Merge successful!")
        else:
            print("✗ Merge still failing")