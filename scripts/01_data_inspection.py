#!/usr/bin/env python3
"""
NEET-PG College Finder - Data Inspection & EDA
===============================================
Comprehensive exploration of the NEET-PG dataset for building production-grade recommender system.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set display options
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

def inspect_dataset(file_path='Neet-PG.csv'):
    """Comprehensive dataset inspection and EDA"""
    
    print("=" * 80)
    print("NEET-PG DATASET INSPECTION & EDA")
    print("=" * 80)
    
    # Load dataset
    print("\n1️⃣ LOADING DATASET...")
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
        print(f"✅ Dataset loaded successfully!")
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(file_path, encoding='latin-1')
            print(f"✅ Dataset loaded with latin-1 encoding!")
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            return None
    
    print(f"📊 Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
    
    # Basic info
    print("\n2️⃣ DATASET SCHEMA & BASIC INFO")
    print("-" * 50)
    print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    # Column analysis
    print("\n📋 COLUMN ANALYSIS:")
    schema_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        unique_count = df[col].nunique()
        missing_count = df[col].isnull().sum()
        missing_pct = (missing_count / len(df)) * 100
        
        schema_info.append({
            'Column': col,
            'Type': dtype,
            'Unique': unique_count,
            'Missing': missing_count,
            'Missing%': f"{missing_pct:.1f}%"
        })
    
    schema_df = pd.DataFrame(schema_info)
    print(schema_df.to_string(index=False))
    
    # Sample data
    print("\n3️⃣ SAMPLE DATA (First 3 rows)")
    print("-" * 50)
    print(df.head(3).to_string())
    
    # Missing values analysis
    print("\n4️⃣ MISSING VALUES ANALYSIS")
    print("-" * 50)
    missing_analysis = df.isnull().sum().sort_values(ascending=False)
    missing_pct = (missing_analysis / len(df) * 100).round(1)
    
    missing_df = pd.DataFrame({
        'Column': missing_analysis.index,
        'Missing_Count': missing_analysis.values,
        'Missing_Percentage': missing_pct.values
    })
    
    # Only show columns with missing values
    missing_df_filtered = missing_df[missing_df['Missing_Count'] > 0]
    if len(missing_df_filtered) > 0:
        print("Columns with missing values:")
        print(missing_df_filtered.to_string(index=False))
    else:
        print("✅ No missing values found!")
    
    # Identify closing rank columns
    print("\n5️⃣ CLOSING RANK COLUMNS ANALYSIS")
    print("-" * 50)
    cr_columns = [col for col in df.columns if 'CR' in col.upper() and any(x in col for x in ['2023', '2024'])]
    print(f"Closing Rank columns found: {len(cr_columns)}")
    for col in cr_columns:
        print(f"  - {col}")
    
    if cr_columns:
        print("\nClosing Rank Statistics:")
        cr_stats = df[cr_columns].describe()
        print(cr_stats)
        
        # Check for non-numeric values in CR columns
        print("\nNon-numeric values in CR columns:")
        for col in cr_columns:
            non_numeric = df[col].apply(lambda x: not str(x).replace('.', '').replace('-', '').isdigit() if pd.notna(x) else False).sum()
            if non_numeric > 0:
                unique_non_numeric = df[col][df[col].apply(lambda x: not str(x).replace('.', '').replace('-', '').isdigit() if pd.notna(x) else False)].unique()
                print(f"  {col}: {non_numeric} non-numeric values - {unique_non_numeric[:10]}")
    
    # Key categorical columns analysis
    print("\n6️⃣ KEY CATEGORICAL COLUMNS")
    print("-" * 50)
    key_cats = ['Category', 'State', 'Course', 'Type of Course', 'Quota', 'Institute']
    
    for col in key_cats:
        if col in df.columns:
            unique_count = df[col].nunique()
            print(f"\n{col}: {unique_count} unique values")
            if unique_count <= 20:
                value_counts = df[col].value_counts().head(10)
                print(value_counts)
            else:
                value_counts = df[col].value_counts().head(10)
                print(f"Top 10 values:")
                print(value_counts)
                
                # Show sample of messy values for high-cardinality columns
                if unique_count > 100:
                    sample_values = df[col].dropna().unique()[:20]
                    print(f"\nSample values (first 20): {list(sample_values)}")
    
    # Numeric columns analysis
    print("\n7️⃣ NUMERIC COLUMNS ANALYSIS")
    print("-" * 50)
    numeric_cols = ['Fees', 'Beds', 'Bond Penalty', 'Stipend Year 1']
    
    for col in numeric_cols:
        if col in df.columns:
            print(f"\n{col}:")
            print(f"  Type: {df[col].dtype}")
            print(f"  Non-null values: {df[col].count():,}")
            
            # Try to identify currency symbols and convert to numeric
            sample_values = df[col].dropna().head(10).tolist()
            print(f"  Sample values: {sample_values}")
            
            # Check for outliers if numeric
            if df[col].dtype in ['int64', 'float64']:
                stats = df[col].describe()
                print(f"  Statistics:\n{stats}")
    
    # Institute type analysis
    print("\n8️⃣ INSTITUTE TYPE ANALYSIS")
    print("-" * 50)
    if 'Institute' in df.columns:
        # Try to infer government vs private from institute names
        govt_keywords = ['government', 'govt', 'medical college', 'aiims', 'pgimer', 'jipmer']
        private_keywords = ['private', 'deemed', 'university']
        
        institute_names = df['Institute'].dropna().str.lower()
        govt_count = sum(any(keyword in name for keyword in govt_keywords) for name in institute_names)
        private_count = sum(any(keyword in name for keyword in private_keywords) for name in institute_names)
        
        print(f"Likely Government institutes: {govt_count}")
        print(f"Likely Private institutes: {private_count}")
        print(f"Unclear: {len(institute_names) - govt_count - private_count}")
    
    # Save summary statistics
    print("\n9️⃣ SAVING ANALYSIS RESULTS")
    print("-" * 50)
    
    # Save schema info
    schema_df.to_csv('data_schema.csv', index=False)
    print("✅ Schema saved to: data_schema.csv")
    
    # Save missing values analysis
    if len(missing_df_filtered) > 0:
        missing_df_filtered.to_csv('missing_values_analysis.csv', index=False)
        print("✅ Missing values analysis saved to: missing_values_analysis.csv")
    
    # Save closing rank columns analysis
    if cr_columns:
        cr_analysis = df[cr_columns + ['Institute', 'Course', 'Quota', 'Category']].copy()
        cr_analysis.to_csv('closing_ranks_sample.csv', index=False)
        print("✅ Closing ranks sample saved to: closing_ranks_sample.csv")
    
    print(f"\n✅ Data inspection completed!")
    return df

if __name__ == "__main__":
    df = inspect_dataset()
    if df is not None:
        print(f"\n🎯 Dataset loaded and analyzed: {df.shape[0]:,} rows × {df.shape[1]} columns")
        print(f"Ready for data cleaning and feature engineering!")