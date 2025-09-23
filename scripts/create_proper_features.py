#!/usr/bin/env python3
"""
Create proper features dataset that preserves original granularity
"""
import pandas as pd
import numpy as np
from datetime import datetime

def parse_currency(value):
    """Parse currency string to float"""
    if pd.isna(value) or value == 'Info not available' or value == '-':
        return None
    
    if isinstance(value, (int, float)):
        return float(value)
    
    # Remove currency symbols and formatting
    value = str(value).replace('₹', '').replace(',', '').replace(' ', '')
    
    try:
        return float(value)
    except:
        return None

def infer_institute_type(institute_name):
    """Infer institute type from name"""
    institute_name = str(institute_name).upper()
    
    if any(word in institute_name for word in ['GOVT', 'GOVERNMENT', 'STATE', 'AIIMS', 'JIPMER', 'SGPGI']):
        return 'Government'
    elif any(word in institute_name for word in ['PRIVATE', 'PVT']):
        return 'Private'
    elif any(word in institute_name for word in ['CHRISTIAN', 'MUSLIM', 'MINORITY']):
        return 'Minority'
    else:
        return 'Unknown'

def create_basic_features():
    """Create basic features from original raw data while preserving key columns"""
    print("Loading original dataset...")
    df = pd.read_csv('Neet-PG.csv')
    print(f"Original dataset shape: {df.shape}")
    
    # Drop unnamed columns
    df = df.drop([col for col in df.columns if 'Unnamed' in col], axis=1)
    
    # Clean institute names - make consistent with closing ranks
    df['Institute'] = df['Institute'].str.strip().str.upper()
    
    # Parse financial columns
    print("Parsing financial columns...")
    df['Fee_Parsed'] = df['Fee'].apply(parse_currency)
    df['Stipend_Year1_Parsed'] = df['Stipend Year 1'].apply(parse_currency)
    df['Bond_Penalty_Parsed'] = df['Bond Penalty'].apply(parse_currency)
    
    # Parse Bond Years
    def parse_numeric(value):
        if pd.isna(value) or str(value).strip() in ['-', 'Info Not Available', 'Info not available', '']:
            return None
        try:
            return float(value)
        except:
            return None
    
    df['Bond_Years_Parsed'] = df['Bond Years'].apply(parse_numeric)
    
    # Parse Beds
    df['Beds_Parsed'] = df['Beds'].apply(parse_numeric)
    
    # Create institute type
    df['Institute_Type'] = df['Institute'].apply(infer_institute_type)
    
    # Create course type mapping
    course_type_map = {
        'CLINICAL': ['ANAESTHESIOLOGY', 'DERMATOLOGY', 'ENT', 'EMERGENCY MEDICINE', 'GENERAL MEDICINE',
                    'GENERAL SURGERY', 'OBSTETRICS AND GYNAECOLOGY', 'OPHTHALMOLOGY', 'ORTHOPAEDICS',
                    'PAEDIATRICS', 'PSYCHIATRY', 'RADIOLOGY', 'RADIOTHERAPY', 'TUBERCULOSIS & CHEST DISEASES',
                    'NUCLEAR MEDICINE', 'PLASTIC SURGERY', 'NEUROSURGERY', 'CARDIOLOGY', 'NEPHROLOGY'],
        'PRE CLINICAL': ['ANATOMY', 'PHYSIOLOGY', 'BIOCHEMISTRY', 'PHARMACOLOGY', 'PATHOLOGY', 'MICROBIOLOGY', 'FORENSIC MEDICINE'],
        'PARA CLINICAL': ['DCP', 'DPM', 'DMRD', 'HOSPITAL ADMINISTRATION']
    }
    
    def get_course_type(course):
        for course_type, courses in course_type_map.items():
            if course in courses:
                return course_type
        return 'OTHER'
    
    df['Course_Type'] = df['Course'].apply(get_course_type)
    
    # Create basic features
    basic_features_df = df[[
        'Institute', 'Course', 'State', 'Category', 'Quota', 'Type of Course',
        'Institute_Type', 'Fee_Parsed', 'Stipend_Year1_Parsed', 'Bond_Years_Parsed', 
        'Bond_Penalty_Parsed', 'Beds_Parsed', 'Course_Type'
    ]].copy()
    
    # Rename for consistency
    basic_features_df = basic_features_df.rename(columns={
        'Type of Course': 'Original_Course_Type',
        'Fee_Parsed': 'Annual_Fees',
        'Stipend_Year1_Parsed': 'Stipend_Year1',
        'Bond_Years_Parsed': 'Bond_Years',
        'Bond_Penalty_Parsed': 'Bond_Amount',
        'Beds_Parsed': 'Total_Beds'
    })
    
    return basic_features_df

def add_aggregate_features(features_df):
    """Add aggregate features while maintaining granularity"""
    print("Adding aggregate features...")
    
    # Institute-level aggregates
    institute_agg = features_df.groupby('Institute').agg({
        'Annual_Fees': ['mean', 'min', 'max', 'std'],
        'Stipend_Year1': ['mean', 'min', 'max'],
        'Bond_Years': ['mean', 'max'],
        'Bond_Amount': ['mean', 'max'],
        'Total_Beds': ['mean', 'max'],
        'Course': 'nunique',
        'State': 'first',
        'Institute_Type': 'first'
    }).round(2)
    
    # Flatten columns
    institute_agg.columns = ['_'.join(col).strip() for col in institute_agg.columns]
    institute_agg = institute_agg.reset_index()
    
    # Merge back
    features_df = features_df.merge(institute_agg, on='Institute', how='left')
    
    # Create derived features
    features_df['fee_bracket'] = features_df['Annual_Fees'].apply(
        lambda x: 'Low' if pd.notna(x) and x <= 50000 
        else 'Medium' if pd.notna(x) and x <= 200000 
        else 'High' if pd.notna(x) else 'Unknown'
    )
    
    features_df['stipend_fee_ratio'] = features_df.apply(
        lambda row: row['Stipend_Year1'] / row['Annual_Fees'] 
        if pd.notna(row['Stipend_Year1']) and pd.notna(row['Annual_Fees']) and row['Annual_Fees'] > 0 
        else None, axis=1
    )
    
    features_df['has_bond'] = features_df['Bond_Years'].notna().astype(int)
    features_df['beds_per_course'] = features_df['Total_Beds'] / features_df['Course_nunique']
    
    # Category and Quota features
    features_df['category_main'] = features_df['Category'].str.split('-').str[0]
    features_df['quota_state'] = features_df['Quota'].str.split(' ').str[0]
    
    return features_df

def create_closing_ranks_features():
    """Create features from closing ranks data"""
    print("Loading closing ranks data...")
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    
    # Calculate rank statistics for each combination
    rank_stats = ranks_df.groupby(['Institute', 'Course', 'State', 'Category', 'Quota']).agg({
        'closing_rank': ['count', 'mean', 'median', 'min', 'max', 'std'],
        'year': ['min', 'max'],
        'round': ['min', 'max', 'nunique']
    }).round(2)
    
    # Flatten columns
    rank_stats.columns = ['_'.join(col).strip() for col in rank_stats.columns]
    rank_stats = rank_stats.reset_index()
    
    # Rename for clarity
    rank_stats = rank_stats.rename(columns={
        'closing_rank_count': 'total_rank_records',
        'closing_rank_mean': 'mean_closing_rank',
        'closing_rank_median': 'median_closing_rank',
        'closing_rank_min': 'min_closing_rank',
        'closing_rank_max': 'max_closing_rank',
        'closing_rank_std': 'std_closing_rank',
        'year_min': 'first_year',
        'year_max': 'last_year',
        'round_min': 'first_round',
        'round_max': 'last_round',
        'round_nunique': 'total_rounds'
    })
    
    # Calculate derived features
    rank_stats['rank_range'] = rank_stats['max_closing_rank'] - rank_stats['min_closing_rank']
    rank_stats['competitiveness'] = 1 / (rank_stats['mean_closing_rank'] + 1)  # Inverse for higher=better
    rank_stats['stability'] = 1 / (rank_stats['std_closing_rank'] + 1)  # More stable = lower std
    
    return rank_stats

def main():
    print("=== CREATING PROPER FEATURES DATASET ===")
    
    # Create basic features
    features_df = create_basic_features()
    print(f"Basic features shape: {features_df.shape}")
    
    # Add aggregate features
    features_df = add_aggregate_features(features_df)
    print(f"Features with aggregates shape: {features_df.shape}")
    
    # Create closing ranks features
    rank_features = create_closing_ranks_features()
    print(f"Rank features shape: {rank_features.shape}")
    
    # Merge features with rank statistics
    print("Merging features with rank statistics...")
    merged_features = features_df.merge(
        rank_features, 
        on=['Institute', 'Course', 'State', 'Category', 'Quota'],
        how='left'  # Keep all feature combinations, even without ranks
    )
    
    print(f"Final merged features shape: {merged_features.shape}")
    print(f"Features with rank data: {merged_features['mean_closing_rank'].notna().sum()}")
    
    # Save the dataset
    print("Saving features dataset...")
    merged_features.to_csv('neet_pg_features_proper.csv', index=False)
    print("Saved as 'neet_pg_features_proper.csv'")
    
    # Test merge with closing ranks
    print("\nTesting merge with closing ranks...")
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    
    test_merge = merged_features.merge(
        ranks_df,
        on=['Institute', 'Course', 'State', 'Category', 'Quota'],
        how='inner'
    )
    
    print(f"Test merge shape: {test_merge.shape}")
    if test_merge.shape[0] > 0:
        print("✓ Merge successful!")
        
        # Show sample
        print(f"\nSample merged data:")
        print(test_merge[['Institute', 'Course', 'Category', 'Quota', 'closing_rank', 'year', 'round']].head())
        
        return merged_features, test_merge
    else:
        print("✗ Merge still failing")
        return merged_features, None

if __name__ == "__main__":
    features_df, test_merge = main()