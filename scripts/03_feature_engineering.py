#!/usr/bin/env python3
"""
NEET-PG College Finder - Feature Engineering
============================================
Advanced feature engineering for ranking and prediction models.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class NEETPGFeatureEngineer:
    """Production-grade feature engineering pipeline"""
    
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=50, ngram_range=(1, 2))
        
    def load_clean_data(self):
        """Load cleaned datasets"""
        print("📊 Loading cleaned datasets...")
        
        df_clean = pd.read_csv('../data/processed/neet_pg_clean.csv')
        cr_long = pd.read_csv('../data/processed/closing_ranks_long.csv')
        
        print(f"✅ Main dataset: {df_clean.shape[0]:,} rows")
        print(f"✅ Closing ranks: {len(cr_long):,} records")
        
        return df_clean, cr_long
    
    def create_historical_statistics(self, df_clean, cr_long):
        """Generate historical closing rank statistics for each institute-course-quota combination"""
        print("\n🔢 CREATING HISTORICAL STATISTICS...")
        
        # Group by institute, course, quota, category
        group_cols = ['Institute', 'Course', 'Quota', 'Category']
        
        # Calculate statistics for each group
        historical_stats = cr_long.groupby(group_cols + ['year'])['closing_rank'].agg([
            'count', 'mean', 'median', 'min', 'max', 'std'
        ]).reset_index()
        
        # Overall statistics across years
        overall_stats = cr_long.groupby(group_cols)['closing_rank'].agg([
            ('total_rounds', 'count'),
            ('mean_closing_rank', 'mean'),
            ('median_closing_rank', 'median'),
            ('min_closing_rank', 'min'),
            ('max_closing_rank', 'max'),
            ('std_closing_rank', 'std'),
            ('rank_range', lambda x: x.max() - x.min() if len(x) > 1 else 0)
        ]).reset_index()
        
        # Year-over-year trend (2023 vs 2024)
        yearly_comparison = cr_long.groupby(group_cols + ['year'])['closing_rank'].median().reset_index()
        yearly_pivot = yearly_comparison.pivot_table(
            index=group_cols, columns='year', values='closing_rank'
        ).reset_index()
        
        # Calculate trend
        if 2023 in yearly_pivot.columns and 2024 in yearly_pivot.columns:
            yearly_pivot['rank_trend'] = yearly_pivot[2024] - yearly_pivot[2023]
            yearly_pivot['trend_direction'] = yearly_pivot['rank_trend'].apply(
                lambda x: 'improving' if x < 0 else 'worsening' if x > 0 else 'stable'
            )
        
        # Round-wise stability (coefficient of variation across rounds within same year)
        round_stability = cr_long.groupby(group_cols + ['year'])['closing_rank'].agg([
            ('round_cv', lambda x: x.std() / x.mean() if len(x) > 1 and x.mean() > 0 else 0)
        ]).reset_index()
        
        round_stability_avg = round_stability.groupby(group_cols)['round_cv'].mean().reset_index()
        round_stability_avg.columns = group_cols + ['stability_index']
        
        print(f"✅ Generated historical statistics for {len(overall_stats)} combinations")
        
        return overall_stats, yearly_pivot, round_stability_avg
    
    def create_applicant_features(self, candidate_air, candidate_category, candidate_state):
        """Generate applicant-specific features"""
        features = {}
        
        # Normalized AIR (percentile-based)
        # Assuming NEET-PG has ~200K candidates (approximate)
        total_candidates = 200000
        features['air_percentile'] = (total_candidates - candidate_air) / total_candidates * 100
        features['air_normalized'] = candidate_air / total_candidates
        features['air_log'] = np.log1p(candidate_air)
        
        # AIR brackets for categorical analysis
        if candidate_air <= 1000:
            features['air_bracket'] = 'Top_1K'
        elif candidate_air <= 5000:
            features['air_bracket'] = 'Top_5K'
        elif candidate_air <= 10000:
            features['air_bracket'] = 'Top_10K'
        elif candidate_air <= 25000:
            features['air_bracket'] = 'Top_25K'
        else:
            features['air_bracket'] = 'Below_25K'
        
        # Category-specific features
        features['is_general'] = 1 if candidate_category == 'GENERAL' else 0
        features['is_reserved'] = 1 if candidate_category in ['OBC', 'SC', 'ST'] else 0
        features['is_ews'] = 1 if candidate_category == 'EWS' else 0
        features['is_ph'] = 1 if 'PH' in candidate_category else 0
        
        # State preference
        features['candidate_state'] = candidate_state
        
        return features
    
    def create_institute_features(self, df_clean):
        """Generate institute-level features"""
        print("\n🏥 CREATING INSTITUTE FEATURES...")
        
        # Aggregate by institute
        institute_features = df_clean.groupby('Institute').agg({
            'Annual_Fees': ['mean', 'min', 'max', 'std'],
            'Stipend_Year1': ['mean', 'min', 'max'],
            'Bond_Years': ['mean', 'max'],
            'Bond_Amount': ['mean', 'max'],
            'Total_Beds': ['mean', 'max'],
            'Course': 'nunique',
            'State': 'first',
            'Institute_Type': 'first'
        }).reset_index()
        
        # Flatten column names
        institute_features.columns = ['Institute'] + [
            f'institute_{col[0]}_{col[1]}' if col[1] != '' else f'institute_{col[0]}'
            for col in institute_features.columns[1:]
        ]
        
        # Fee brackets
        institute_features['fee_bracket'] = pd.cut(
            institute_features['institute_Annual_Fees_mean'],
            bins=[0, 50000, 200000, 500000, 1000000, float('inf')],
            labels=['Low', 'Medium', 'High', 'Very_High', 'Premium']
        )
        
        # Stipend to Fee ratio
        institute_features['stipend_fee_ratio'] = (
            institute_features['institute_Stipend_Year1_mean'] / 
            institute_features['institute_Annual_Fees_mean']
        ).fillna(0)
        
        # Bond penalty indicator
        institute_features['has_bond'] = (institute_features['institute_Bond_Years_mean'] > 0).astype(int)
        
        # Beds per course ratio (capacity indicator)
        institute_features['beds_per_course'] = (
            institute_features['institute_Total_Beds_max'] / 
            institute_features['institute_Course_nunique']
        ).fillna(0)
        
        print(f"✅ Generated features for {len(institute_features)} institutes")
        
        return institute_features
    
    def create_course_features(self, df_clean, cr_long):
        """Generate course-level features"""
        print("\n📚 CREATING COURSE FEATURES...")
        
        # Course popularity and competitiveness
        course_features = cr_long.groupby('Course').agg({
            'closing_rank': ['count', 'mean', 'median', 'std', 'min'],
        }).reset_index()
        
        course_features.columns = ['Course'] + [
            f'course_{col[0]}_{col[1]}' if col[1] != '' else f'course_{col[0]}'
            for col in course_features.columns[1:]
        ]
        
        # Course competitiveness (lower median closing rank = more competitive)
        course_features['course_competitiveness'] = 1 / (course_features['course_closing_rank_median'] + 1)
        
        # Course type mapping
        course_type_mapping = df_clean[['Course', 'Course_Type']].drop_duplicates()
        course_features = course_features.merge(course_type_mapping, on='Course', how='left')
        
        # Seats availability (approximate from data frequency)
        total_records = len(df_clean)
        course_features['course_availability'] = course_features['course_closing_rank_count'] / total_records
        
        print(f"✅ Generated features for {len(course_features)} courses")
        
        return course_features
    
    def create_interaction_features(self, features_df):
        """Create interaction features between key variables"""
        print("\n🔗 CREATING INTERACTION FEATURES...")
        
        interactions = features_df.copy()
        
        # Category × Quota interactions
        interactions['category_quota'] = interactions['Category'].astype(str) + '_' + interactions['Quota'].astype(str)
        
        # State × Quota interactions (home state advantage)
        interactions['state_quota'] = interactions['State'].astype(str) + '_' + interactions['Quota'].astype(str)
        
        # Course × Institute Type interactions
        interactions['course_institute_type'] = interactions['Course'].astype(str) + '_' + interactions['Institute_Type'].astype(str)
        
        # Fee × Bond interactions
        interactions['fee_bond_interaction'] = interactions['Annual_Fees'] * interactions['Bond_Years']
        
        # Competitiveness × Availability interaction
        if 'course_competitiveness' in interactions.columns and 'course_availability' in interactions.columns:
            interactions['competitive_availability'] = (
                interactions['course_competitiveness'] * interactions['course_availability']
            )
        
        print("✅ Interaction features created")
        
        return interactions
    
    def create_target_encoding(self, df, categorical_cols, target_col='median_closing_rank'):
        """Create target-encoded features for high-cardinality categoricals"""
        print(f"\n🎯 CREATING TARGET ENCODING FOR: {categorical_cols}")
        
        encoded_features = df.copy()
        
        for col in categorical_cols:
            if col in df.columns:
                # Global mean for smoothing
                global_mean = df[target_col].mean()
                
                # Category means
                category_stats = df.groupby(col)[target_col].agg(['mean', 'count']).reset_index()
                
                # Smoothed target encoding (empirical Bayes)
                alpha = 10  # Smoothing parameter
                category_stats['target_encoded'] = (
                    (category_stats['mean'] * category_stats['count'] + global_mean * alpha) /
                    (category_stats['count'] + alpha)
                )
                
                # Merge back
                encoding_map = dict(zip(category_stats[col], category_stats['target_encoded']))
                encoded_features[f'{col}_target_encoded'] = encoded_features[col].map(encoding_map)
        
        print("✅ Target encoding completed")
        
        return encoded_features
    
    def create_embedding_features(self, text_data, feature_name='text_embedding'):
        """Create text embedding features using TF-IDF"""
        print(f"\n📝 CREATING TEXT EMBEDDINGS FOR: {feature_name}")
        
        # Fit TF-IDF
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(text_data)
        
        # Reduce dimensionality
        svd = TruncatedSVD(n_components=10)
        embeddings = svd.fit_transform(tfidf_matrix)
        
        # Create feature names
        feature_names = [f'{feature_name}_{i}' for i in range(embeddings.shape[1])]
        embedding_df = pd.DataFrame(embeddings, columns=feature_names)
        
        print(f"✅ Created {embeddings.shape[1]} embedding features")
        
        return embedding_df
    
    def engineer_features(self, candidate_air=50000, candidate_category='GENERAL', 
                         candidate_state='KARNATAKA', save_features=True):
        """Main feature engineering pipeline"""
        print("=" * 80)
        print("NEET-PG FEATURE ENGINEERING PIPELINE")
        print("=" * 80)
        
        # Load data
        df_clean, cr_long = self.load_clean_data()
        
        # Create historical statistics
        overall_stats, yearly_trends, stability_stats = self.create_historical_statistics(df_clean, cr_long)
        
        # Create base features dataset by merging with historical stats
        base_features = df_clean.merge(overall_stats, on=['Institute', 'Course', 'Quota', 'Category'], how='left')
        
        # Add yearly trends
        yearly_trends_simple = yearly_trends[['Institute', 'Course', 'Quota', 'Category', 'rank_trend']].copy()
        base_features = base_features.merge(yearly_trends_simple, on=['Institute', 'Course', 'Quota', 'Category'], how='left')
        
        # Add stability metrics
        base_features = base_features.merge(stability_stats, on=['Institute', 'Course', 'Quota', 'Category'], how='left')
        
        # Create institute features
        institute_features = self.create_institute_features(df_clean)
        base_features = base_features.merge(institute_features, on='Institute', how='left')
        
        # Create course features
        course_features = self.create_course_features(df_clean, cr_long)
        base_features = base_features.merge(course_features, on='Course', how='left')
        
        # Create applicant features (example)
        applicant_features = self.create_applicant_features(candidate_air, candidate_category, candidate_state)
        
        # Add applicant features to each row (for prediction context)
        for key, value in applicant_features.items():
            base_features[f'applicant_{key}'] = value
        
        # Create interaction features
        feature_rich = self.create_interaction_features(base_features)
        
        # Create target encoding for high-cardinality features
        high_card_cols = ['Institute', 'Course']
        if 'median_closing_rank' in feature_rich.columns:
            feature_rich = self.create_target_encoding(feature_rich, high_card_cols)
        
        # Create text embeddings for institute names
        institute_embeddings = self.create_embedding_features(feature_rich['Institute'].astype(str), 'institute_embedding')
        feature_rich = pd.concat([feature_rich.reset_index(drop=True), institute_embeddings], axis=1)
        
        # Fill missing values
        print("\n🔧 HANDLING MISSING VALUES...")
        numeric_cols = feature_rich.select_dtypes(include=[np.number]).columns
        feature_rich[numeric_cols] = feature_rich[numeric_cols].fillna(feature_rich[numeric_cols].median())
        
        categorical_cols = feature_rich.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            feature_rich[col] = feature_rich[col].fillna('Unknown')
        
        print(f"✅ Final feature set: {feature_rich.shape[0]:,} rows × {feature_rich.shape[1]} columns")
        
        if save_features:
            print("\n💾 SAVING FEATURE DATASETS...")
            feature_rich.to_csv('../data/processed/neet_pg_features.csv', index=False)
            
            # Save feature importance summary
            feature_summary = pd.DataFrame({
                'Feature': feature_rich.columns,
                'Type': [str(dtype) for dtype in feature_rich.dtypes],
                'Missing_Count': [feature_rich[col].isnull().sum() for col in feature_rich.columns],
                'Unique_Values': [feature_rich[col].nunique() for col in feature_rich.columns]
            })
            feature_summary.to_csv('../data/processed/feature_summary.csv', index=False)
            
            print("✅ Features saved: ../data/processed/neet_pg_features.csv")
            print("✅ Feature summary saved: ../data/processed/feature_summary.csv")
        
        return feature_rich, cr_long
    
    def create_prediction_targets(self, feature_rich, cr_long):
        """Create prediction targets for modeling"""
        print("\n🎯 CREATING PREDICTION TARGETS...")
        
        # For each institute-course-quota-category combination, create targets
        targets_df = feature_rich[['Institute', 'Course', 'Quota', 'Category']].copy()
        
        # Merge with latest closing ranks (2024 data as ground truth)
        latest_ranks = cr_long[cr_long['year'] == 2024].groupby(
            ['Institute', 'Course', 'Quota', 'Category']
        )['closing_rank'].agg(['median', 'min', 'max']).reset_index()
        
        targets_df = targets_df.merge(latest_ranks, on=['Institute', 'Course', 'Quota', 'Category'], how='left')
        
        # Binary admission probability target (example AIR threshold)
        example_air = 50000
        targets_df['admission_probability'] = (targets_df['median'] >= example_air).astype(int)
        
        # Rank prediction target
        targets_df['closing_rank_target'] = targets_df['median']
        
        print(f"✅ Created targets for {len(targets_df)} combinations")
        
        return targets_df

if __name__ == "__main__":
    engineer = NEETPGFeatureEngineer()
    
    # Example candidate
    example_air = 35000
    example_category = 'GENERAL'
    example_state = 'KARNATAKA'
    
    feature_rich, cr_long = engineer.engineer_features(
        candidate_air=example_air,
        candidate_category=example_category,
        candidate_state=example_state
    )
    
    # Create targets
    targets = engineer.create_prediction_targets(feature_rich, cr_long)
    
    print(f"\n🎯 FEATURE ENGINEERING SUMMARY:")
    print(f"   📊 Features: {feature_rich.shape[1]} features")
    print(f"   🎯 Targets: {len(targets)} target combinations")
    print(f"   📈 Ready for model training!")
    
    # Sample features for verification
    print(f"\n📋 SAMPLE FEATURES:")
    numeric_features = feature_rich.select_dtypes(include=[np.number]).columns[:10]
    print(feature_rich[numeric_features].head())