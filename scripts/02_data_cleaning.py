#!/usr/bin/env python3
"""
NEET-PG College Finder - Data Cleaning & Normalization
=====================================================
Comprehensive data cleaning, standardization, and transformation pipeline.
"""

import pandas as pd
import numpy as np
import re
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class NEETPGDataCleaner:
    """Production-grade data cleaning pipeline for NEET-PG dataset"""
    
    def __init__(self):
        # Canonical category mapping
        self.category_mapping = {
            # General/Open categories
            'OPEN-GEN': 'GENERAL', 'GEN': 'GENERAL', 'UR': 'GENERAL', 'GM': 'GENERAL',
            'OPEN': 'GENERAL', 'OPEN-MALE': 'GENERAL', 'GENERAL': 'GENERAL',
            'OPEN-FEM': 'GENERAL', 'OPEN-FEMALE': 'GENERAL',
            
            # OBC categories
            'OBC': 'OBC', 'OBC-GEN': 'OBC', 'OBC-MALE': 'OBC', 'OBC-FEM': 'OBC', 'OBC-FEMALE': 'OBC',
            'BCA-GEN': 'OBC', 'BCB-GEN': 'OBC', 'BCC-GEN': 'OBC', 'BCD-GEN': 'OBC', 'BCE-GEN': 'OBC',
            'BCA-FEM': 'OBC', 'BCB-FEM': 'OBC', 'BCC-FEM': 'OBC', 'BCD-FEM': 'OBC', 'BCE-FEM': 'OBC',
            'BCA-FEMALE': 'OBC', 'BCB-FEMALE': 'OBC', 'BCC-FEMALE': 'OBC', 'BCD-FEMALE': 'OBC', 'BCE-FEMALE': 'OBC',
            'BCA-MALE': 'OBC', 'BCB-MALE': 'OBC', 'BCC-MALE': 'OBC', 'BCD-MALE': 'OBC', 'BCE-MALE': 'OBC',
            
            # SC categories  
            'SC': 'SC', 'SC-GEN': 'SC', 'SC-MALE': 'SC', 'SC-FEM': 'SC', 'SC-FEMALE': 'SC',
            
            # ST categories
            'ST': 'ST', 'ST-GEN': 'ST', 'ST-MALE': 'ST', 'ST-FEM': 'ST', 'ST-FEMALE': 'ST',
            
            # EWS categories
            'EWS': 'EWS', 'EWS-GEN': 'EWS', 'EWS-MALE': 'EWS', 'EWS-FEM': 'EWS', 'EWS-FEMALE': 'EWS',
            
            # PH categories
            'PH': 'PH', 'PwD': 'PH', 'HANDICAPPED': 'PH', 'DIFFERENTLY ABLED': 'PH',
            
            # NRI categories
            'NRI': 'NRI', 'FOREIGN': 'NRI', 'OVERSEAS': 'NRI',
            
            # Management/Private
            'MGMT': 'MANAGEMENT', 'MANAGEMENT': 'MANAGEMENT', 'PRIVATE': 'MANAGEMENT'
        }
        
        # Canonical quota mapping
        self.quota_mapping = {
            # All India Quota
            'AIQ': 'All India Quota', 'All India': 'All India Quota', 'All India Quota': 'All India Quota',
            
            # State Quota patterns - will be handled dynamically
            # Government quotas
            'Govt Quota': 'State Government', 'Government': 'State Government',
            
            # Management quotas
            'Mgmt': 'Management', 'Management': 'Management', 'Mgmt Quota': 'Management',
            'Private': 'Management', 'Priv': 'Management',
            
            # NRI quotas
            'NRI': 'NRI Quota', 'NRI Quota': 'NRI Quota',
            
            # Minority quotas
            'Minority': 'Minority Quota', 'Min': 'Minority Quota',
            
            # Institutional quotas
            'Inst': 'Institutional', 'Institutional': 'Institutional',
            
            # DNB quotas
            'DNB': 'DNB', 'DNB Seats': 'DNB'
        }
        
        # Course type standardization
        self.course_type_mapping = {
            'CLINICAL': 'Clinical', 'clinical': 'Clinical',
            'PARA CLINICAL': 'Para Clinical', 'para clinical': 'Para Clinical', 'PARA CLINIC': 'Para Clinical',
            'PRE CLINICAL': 'Pre Clinical', 'pre clinical': 'Pre Clinical', 'PRE CLINIC': 'Pre Clinical',
            'NON CLINICAL': 'Non Clinical', 'non clinical': 'Non Clinical'
        }
        
    def clean_text_column(self, series):
        """Standard text cleaning pipeline"""
        return (series
                .astype(str)
                .str.strip()
                .str.replace(r'\s+', ' ', regex=True)  # Multiple spaces to single
                .str.replace(r'[^\w\s\-.,()]', '', regex=True)  # Remove special chars except basic punctuation
                .str.upper()
        )
    
    def parse_currency(self, series):
        """Convert currency strings to numeric values"""
        def extract_numeric(val):
            if pd.isna(val) or val == '-' or val == '':
                return np.nan
            
            # Remove currency symbols and commas
            val_clean = re.sub(r'[₹,\s]', '', str(val))
            
            # Handle different number formats
            if '.' in val_clean:
                try:
                    return float(val_clean)
                except:
                    return np.nan
            else:
                try:
                    return int(val_clean)
                except:
                    return np.nan
        
        return series.apply(extract_numeric)
    
    def standardize_category(self, category):
        """Standardize category using mapping and pattern matching"""
        if pd.isna(category):
            return 'GENERAL'
        
        cat_upper = str(category).upper().strip()
        
        # Direct mapping
        if cat_upper in self.category_mapping:
            return self.category_mapping[cat_upper]
        
        # Pattern-based mapping for complex categories
        if 'PHO' in cat_upper or 'PH' in cat_upper:
            base_cat = cat_upper.replace('-PHO', '').replace('-PH', '').strip()
            if base_cat in self.category_mapping:
                return self.category_mapping[base_cat] + '_PH'
            return 'GENERAL_PH'
        
        # Handle OBC variants
        if any(x in cat_upper for x in ['BC', 'OBC']):
            return 'OBC'
        
        # Handle SC variants
        if 'SC' in cat_upper and 'BC' not in cat_upper:
            return 'SC'
        
        # Handle ST variants
        if 'ST' in cat_upper and 'SC' not in cat_upper:
            return 'ST'
        
        # Default to GENERAL
        return 'GENERAL'
    
    def standardize_quota(self, quota):
        """Standardize quota using mapping and pattern matching"""
        if pd.isna(quota):
            return 'State Government'
        
        quota_clean = str(quota).strip()
        
        # State-specific patterns
        state_patterns = {
            'AP ': 'Andhra Pradesh ', 'KAR ': 'Karnataka ', 'MAHA ': 'Maharashtra ',
            'TN ': 'Tamil Nadu ', 'Tel ': 'Telangana ', 'GUJ ': 'Gujarat ',
            'WB ': 'West Bengal ', 'UP-': 'Uttar Pradesh ', 'RAJ ': 'Rajasthan ',
            'HAR ': 'Haryana ', 'MP ': 'Madhya Pradesh ', 'ASS ': 'Assam '
        }
        
        for abbrev, full_name in state_patterns.items():
            if quota_clean.startswith(abbrev):
                quota_clean = quota_clean.replace(abbrev, full_name, 1)
        
        # Determine quota type
        if any(x in quota_clean.upper() for x in ['GOVT', 'GOVERNMENT']):
            return 'State Government'
        elif any(x in quota_clean.upper() for x in ['MGMT', 'MANAGEMENT', 'PRIV', 'PRIVATE']):
            return 'Management'
        elif 'NRI' in quota_clean.upper():
            return 'NRI Quota'
        elif 'MINORITY' in quota_clean.upper():
            return 'Minority Quota'
        elif 'DNB' in quota_clean.upper():
            return 'DNB'
        elif 'AIQ' in quota_clean.upper() or 'ALL INDIA' in quota_clean.upper():
            return 'All India Quota'
        else:
            return 'State Government'  # Default
    
    def parse_closing_ranks(self, df):
        """Parse closing rank columns and convert to long format"""
        # Identify CR columns
        cr_columns = [col for col in df.columns if 'CR' in col.upper() and any(x in col for x in ['2023', '2024'])]
        
        print(f"📊 Processing {len(cr_columns)} closing rank columns...")
        
        # Create a copy for processing
        df_with_id = df.copy()
        df_with_id['record_id'] = df_with_id.index
        
        # Convert CR columns to numeric, replacing non-numeric values with NaN
        for col in cr_columns:
            df_with_id[col] = df_with_id[col].replace('-', np.nan)
            df_with_id[col] = pd.to_numeric(df_with_id[col], errors='coerce')
        
        # Melt to long format
        id_vars = ['record_id', 'Institute', 'Course', 'Quota', 'Category', 'State', 'Type of Course']
        
        cr_long = df_with_id.melt(
            id_vars=id_vars,
            value_vars=cr_columns,
            var_name='round_info',
            value_name='closing_rank'
        )
        
        # Extract year and round from column names
        cr_long['year'] = cr_long['round_info'].str.extract(r'(\d{4})').astype(int)
        cr_long['round'] = cr_long['round_info'].str.extract(r'(\d+)$').astype(int)
        
        # Remove rows with missing closing ranks and ensure all ranks are numeric
        cr_long = cr_long.dropna(subset=['closing_rank'])
        cr_long = cr_long[pd.to_numeric(cr_long['closing_rank'], errors='coerce').notna()]
        cr_long['closing_rank'] = pd.to_numeric(cr_long['closing_rank'], errors='coerce')
        
        print(f"✅ Created {len(cr_long):,} closing rank records")
        return cr_long
    
    def infer_institute_type(self, institute_name):
        """Infer government vs private institute type"""
        if pd.isna(institute_name):
            return 'Unknown'
        
        name_lower = str(institute_name).lower()
        
        # Government indicators
        govt_keywords = [
            'government', 'govt', 'medical college', 'aiims', 'pgimer', 'jipmer',
            'king george', 'seth gs', 'grant med', 'madras med', 'stanley med'
        ]
        
        # Private/Deemed indicators  
        private_keywords = [
            'private', 'deemed', 'university', 'apollo', 'fortis', 'manipal',
            'institute of medical sciences', 'college of medical sciences'
        ]
        
        if any(keyword in name_lower for keyword in govt_keywords):
            return 'Government'
        elif any(keyword in name_lower for keyword in private_keywords):
            return 'Private'
        else:
            return 'Unknown'
    
    def clean_dataset(self, file_path='../data/raw/Neet-PG.csv'):
        """Main cleaning pipeline"""
        print("=" * 80)
        print("NEET-PG DATA CLEANING & NORMALIZATION")
        print("=" * 80)
        
        # Load dataset
        print("\n1️⃣ LOADING DATASET...")
        df = pd.read_csv(file_path, encoding='utf-8')
        print(f"✅ Original shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
        
        # Remove unnamed columns
        print("\n2️⃣ REMOVING UNNECESSARY COLUMNS...")
        unnamed_cols = [col for col in df.columns if col.startswith('Unnamed')]
        if unnamed_cols:
            df = df.drop(columns=unnamed_cols)
            print(f"✅ Removed {len(unnamed_cols)} unnamed columns")
        
        # Clean text columns
        print("\n3️⃣ STANDARDIZING TEXT COLUMNS...")
        text_columns = ['Institute', 'Course', 'State', 'Type of Course', 'Category', 'Quota']
        for col in text_columns:
            if col in df.columns:
                df[col] = self.clean_text_column(df[col])
        print("✅ Text columns standardized")
        
        # Standardize categories
        print("\n4️⃣ CANONICALIZING CATEGORIES...")
        df['Category_Clean'] = df['Category'].apply(self.standardize_category)
        print(f"✅ Reduced {df['Category'].nunique()} categories to {df['Category_Clean'].nunique()}")
        print("Category distribution:")
        print(df['Category_Clean'].value_counts().head(10))
        
        # Standardize quotas
        print("\n5️⃣ CANONICALIZING QUOTAS...")
        df['Quota_Clean'] = df['Quota'].apply(self.standardize_quota)
        print(f"✅ Reduced {df['Quota'].nunique()} quotas to {df['Quota_Clean'].nunique()}")
        print("Quota distribution:")
        print(df['Quota_Clean'].value_counts())
        
        # Standardize course types
        print("\n6️⃣ STANDARDIZING COURSE TYPES...")
        df['Type_of_Course_Clean'] = df['Type of Course'].map(self.course_type_mapping)
        df['Type_of_Course_Clean'] = df['Type_of_Course_Clean'].fillna('Clinical')  # Default to Clinical
        print("Course type distribution:")
        print(df['Type_of_Course_Clean'].value_counts())
        
        # Convert numeric columns
        print("\n7️⃣ CONVERTING NUMERIC COLUMNS...")
        numeric_conversions = {
            'Fee': 'Annual_Fees',
            'Stipend Year 1': 'Stipend_Year1', 
            'Bond Penalty': 'Bond_Amount',
            'Beds': 'Total_Beds'
        }
        
        for old_col, new_col in numeric_conversions.items():
            if old_col in df.columns:
                if old_col == 'Beds':
                    # Beds is already numeric-like
                    df[new_col] = pd.to_numeric(df[old_col], errors='coerce')
                else:
                    # Currency columns
                    df[new_col] = self.parse_currency(df[old_col])
                print(f"✅ Converted {old_col} → {new_col}")
        
        # Convert bond years  
        df['Bond_Years'] = pd.to_numeric(df['Bond Years'], errors='coerce')
        
        # Infer institute type
        print("\n8️⃣ INFERRING INSTITUTE TYPES...")
        df['Institute_Type'] = df['Institute'].apply(self.infer_institute_type)
        print("Institute type distribution:")
        print(df['Institute_Type'].value_counts())
        
        # Parse closing ranks to long format
        print("\n9️⃣ PARSING CLOSING RANKS...")
        cr_long = self.parse_closing_ranks(df)
        
        # Create clean dataset
        clean_columns = [
            'Institute', 'Course', 'State', 'Category_Clean', 'Quota_Clean', 
            'Type_of_Course_Clean', 'Institute_Type', 'Annual_Fees', 'Stipend_Year1',
            'Bond_Years', 'Bond_Amount', 'Total_Beds'
        ]
        
        df_clean = df[clean_columns].copy()
        df_clean.columns = [
            'Institute', 'Course', 'State', 'Category', 'Quota',
            'Course_Type', 'Institute_Type', 'Annual_Fees', 'Stipend_Year1',
            'Bond_Years', 'Bond_Amount', 'Total_Beds'
        ]
        
        print(f"\n✅ CLEANING COMPLETED!")
        print(f"📊 Clean dataset: {df_clean.shape[0]:,} rows × {df_clean.shape[1]} columns")
        print(f"📊 Closing ranks: {len(cr_long):,} records")
        
        return df_clean, cr_long
    
    def save_clean_data(self, df_clean, cr_long):
        """Save cleaned datasets"""
        print("\n🔄 SAVING CLEAN DATASETS...")
        
        # Save main clean dataset
        df_clean.to_csv('../data/processed/neet_pg_clean.csv', index=False)
        print("✅ Clean dataset saved: ../data/processed/neet_pg_clean.csv")
        
        # Save closing ranks
        cr_long.to_csv('../data/processed/closing_ranks_long.csv', index=False)
        print("✅ Closing ranks saved: ../data/processed/closing_ranks_long.csv")
        
        # Save data dictionary
        data_dict = {
            'Column': df_clean.columns,
            'Description': [
                'Medical Institute/College Name',
                'Medical Specialization Course',
                'State where institute is located',
                'Student Category (GENERAL, OBC, SC, ST, EWS, PH, NRI, etc.)',
                'Admission Quota Type',
                'Course Type (Clinical, Para Clinical, Pre Clinical, Non Clinical)',
                'Institute Type (Government, Private, Unknown)',
                'Annual Fee Amount (in INR)',
                'First Year Stipend Amount (in INR)',
                'Bond Period in Years',
                'Bond Penalty Amount (in INR)',
                'Total Number of Beds in Hospital'
            ],
            'Data_Type': [str(dtype) for dtype in df_clean.dtypes]
        }
        
        pd.DataFrame(data_dict).to_csv('../data/data_dictionary.csv', index=False)
        print("✅ Data dictionary saved: ../data/data_dictionary.csv")

if __name__ == "__main__":
    cleaner = NEETPGDataCleaner()
    df_clean, cr_long = cleaner.clean_dataset()
    cleaner.save_clean_data(df_clean, cr_long)
    
    print(f"\n🎯 SUMMARY:")
    print(f"   📊 Main dataset: {df_clean.shape[0]:,} institutes/courses")
    print(f"   📈 Closing ranks: {len(cr_long):,} historical records")
    print(f"   🏥 Unique institutes: {df_clean['Institute'].nunique()}")
    print(f"   📚 Unique courses: {df_clean['Course'].nunique()}")
    print(f"   🌍 States covered: {df_clean['State'].nunique()}")