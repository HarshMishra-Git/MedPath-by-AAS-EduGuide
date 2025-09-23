#!/usr/bin/env python3
"""
Create properly normalized features that match with closing ranks
"""
import pandas as pd
import numpy as np

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

def parse_numeric(value):
    """Parse numeric values with error handling"""
    if pd.isna(value) or str(value).strip() in ['-', 'Info Not Available', 'Info not available', '']:
        return None
    try:
        return float(value)
    except:
        return None

def normalize_text_series(series):
    """Normalize text series to match closing ranks format"""
    return series.astype(str).str.strip().str.upper()

def main():
    print("=== CREATING NORMALIZED FEATURES DATASET ===")
    
    # Load original dataset
    print("Loading original dataset...")
    df = pd.read_csv('Neet-PG.csv')
    print(f"Original dataset shape: {df.shape}")
    
    # Drop unnamed columns
    df = df.drop([col for col in df.columns if 'Unnamed' in col], axis=1)
    
    # Normalize key columns to match closing ranks format
    print("Normalizing key columns...")
    df['Institute'] = normalize_text_series(df['Institute'])
    df['State'] = normalize_text_series(df['State'])
    df['Quota'] = normalize_text_series(df['Quota'])
    # Category and Course are already in correct format
    
    # Parse financial and numeric columns
    print("Parsing financial columns...")
    df['Annual_Fees'] = df['Fee'].apply(parse_currency)
    df['Stipend_Year1'] = df['Stipend Year 1'].apply(parse_currency)
    df['Bond_Amount'] = df['Bond Penalty'].apply(parse_currency)
    df['Bond_Years'] = df['Bond Years'].apply(parse_numeric)
    df['Total_Beds'] = df['Beds'].apply(parse_numeric)
    
    # Create derived features
    print("Creating derived features...")
    
    # Institute type
    def infer_institute_type(institute_name):
        institute_name = str(institute_name).upper()
        if any(word in institute_name for word in ['GOVT', 'GOVERNMENT', 'STATE', 'AIIMS', 'JIPMER', 'SGPGI']):
            return 'Government'
        elif any(word in institute_name for word in ['PRIVATE', 'PVT']):
            return 'Private'
        elif any(word in institute_name for word in ['CHRISTIAN', 'MUSLIM', 'MINORITY']):
            return 'Minority'
        else:
            return 'Unknown'
    
    df['Institute_Type'] = df['Institute'].apply(infer_institute_type)
    
    # Course type
    course_type_map = {
        'Clinical': ['ANAESTHESIOLOGY', 'DERMATOLOGY', 'ENT', 'EMERGENCY MEDICINE', 'GENERAL MEDICINE',
                    'GENERAL SURGERY', 'OBSTETRICS AND GYNAECOLOGY', 'OPHTHALMOLOGY', 'ORTHOPAEDICS',
                    'PAEDIATRICS', 'PSYCHIATRY', 'RADIOLOGY', 'RADIOTHERAPY', 'TUBERCULOSIS & CHEST DISEASES',
                    'NUCLEAR MEDICINE', 'PLASTIC SURGERY', 'NEUROSURGERY', 'CARDIOLOGY', 'NEPHROLOGY'],
        'Pre Clinical': ['ANATOMY', 'PHYSIOLOGY', 'BIOCHEMISTRY', 'PHARMACOLOGY', 'PATHOLOGY', 'MICROBIOLOGY', 'FORENSIC MEDICINE'],
        'Para Clinical': ['DCP', 'DPM', 'DMRD', 'HOSPITAL ADMINISTRATION']
    }
    
    def get_course_type(course):
        for course_type, courses in course_type_map.items():
            if course in courses:
                return course_type
        return 'Other'
    
    df['Course_Type'] = df['Course'].apply(get_course_type)
    
    # Financial features
    df['fee_bracket'] = df['Annual_Fees'].apply(
        lambda x: 'Low' if pd.notna(x) and x <= 50000 
        else 'Medium' if pd.notna(x) and x <= 200000 
        else 'High' if pd.notna(x) else 'Unknown'
    )
    
    df['stipend_fee_ratio'] = df.apply(
        lambda row: row['Stipend_Year1'] / row['Annual_Fees'] 
        if pd.notna(row['Stipend_Year1']) and pd.notna(row['Annual_Fees']) and row['Annual_Fees'] > 0 
        else None, axis=1
    )
    
    df['has_bond'] = df['Bond_Years'].notna().astype(int)
    
    # Category and Quota features
    df['category_main'] = df['Category'].str.split('-').str[0]
    df['quota_state'] = df['Quota'].str.split(' ').str[0]
    
    # Select final columns
    feature_columns = [
        'Institute', 'Course', 'State', 'Category', 'Quota',
        'Type of Course', 'Institute_Type', 'Course_Type',
        'Annual_Fees', 'Stipend_Year1', 'Bond_Years', 'Bond_Amount', 'Total_Beds',
        'fee_bracket', 'stipend_fee_ratio', 'has_bond',
        'category_main', 'quota_state'
    ]
    
    features_df = df[feature_columns].copy()
    print(f"Features dataset shape: {features_df.shape}")
    
    # Now add closing rank statistics
    print("Loading closing ranks data...")
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    
    # Calculate rank statistics for each combination
    print("Calculating rank statistics...")
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
    
    # Calculate derived rank features
    rank_stats['rank_range'] = rank_stats['max_closing_rank'] - rank_stats['min_closing_rank']
    rank_stats['competitiveness'] = 1 / (rank_stats['mean_closing_rank'] + 1)
    rank_stats['stability'] = 1 / (rank_stats['std_closing_rank'] + 1)
    
    print(f"Rank statistics shape: {rank_stats.shape}")
    
    # Test merge first
    print("Testing merge with closing ranks...")
    test_merge = features_df.merge(
        ranks_df.head(1000),  # Test with subset first
        on=['Institute', 'Course', 'State', 'Category', 'Quota'],
        how='inner'
    )
    
    print(f"Test merge shape: {test_merge.shape}")
    
    if test_merge.shape[0] > 0:
        print("✓ Merge working! Proceeding with full merge...")
        
        # Merge features with rank statistics
        final_features = features_df.merge(
            rank_stats,
            on=['Institute', 'Course', 'State', 'Category', 'Quota'],
            how='left'
        )
        
        print(f"Final features shape: {final_features.shape}")
        print(f"Records with rank data: {final_features['mean_closing_rank'].notna().sum()}")
        
        # Save the dataset
        print("Saving normalized features dataset...")
        final_features.to_csv('neet_pg_features_normalized.csv', index=False)
        print("Saved as 'neet_pg_features_normalized.csv'")
        
        # Show sample
        print(f"\nSample of merged data:")
        sample_with_ranks = final_features[final_features['mean_closing_rank'].notna()].head()
        print(sample_with_ranks[['Institute', 'Course', 'Category', 'Quota', 'mean_closing_rank']].head())
        
        return final_features
        
    else:
        print("✗ Merge still failing. Showing detailed comparison...")
        
        # Show exact values for debugging
        orig_sample = features_df.head(1)
        ranks_sample = ranks_df.head(1)
        
        print("\nFirst feature record:")
        for col in ['Institute', 'Course', 'State', 'Category', 'Quota']:
            print(f"{col}: '{orig_sample[col].iloc[0]}'")
        
        print("\nFirst ranks record:")
        for col in ['Institute', 'Course', 'State', 'Category', 'Quota']:
            print(f"{col}: '{ranks_sample[col].iloc[0]}'")
        
        return features_df

if __name__ == "__main__":
    features_df = main()