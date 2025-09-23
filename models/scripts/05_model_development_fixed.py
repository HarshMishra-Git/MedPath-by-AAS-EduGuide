#!/usr/bin/env python3
"""
Model Development with Fixed Features and Closing Ranks Alignment
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, classification_report, confusion_matrix
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb
import joblib
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data():
    """Load and prepare the corrected features and closing ranks data"""
    print("=== LOADING AND PREPARING DATA ===")
    
    # Load the corrected features dataset
    features_df = pd.read_csv('neet_pg_features_normalized.csv')
    print(f"Features dataset shape: {features_df.shape}")
    
    # Load closing ranks data
    ranks_df = pd.read_csv('closing_ranks_long.csv')
    print(f"Closing ranks dataset shape: {ranks_df.shape}")
    
    # Create modeling dataset by merging
    print("Creating modeling dataset...")
    modeling_df = features_df.merge(
        ranks_df,
        on=['Institute', 'Course', 'State', 'Category', 'Quota'],
        how='inner'
    )
    
    print(f"Modeling dataset shape: {modeling_df.shape}")
    print(f"Years available: {sorted(modeling_df['year'].unique())}")
    print(f"Rounds available: {sorted(modeling_df['round'].unique())}")
    
    return modeling_df

def create_modeling_features(df):
    """Create additional modeling features"""
    print("Creating additional modeling features...")
    
    # Encode categorical variables
    label_encoders = {}
    categorical_cols = ['Institute_Type', 'Course_Type', 'fee_bracket', 'category_main', 'quota_state']
    
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
    
    # Create round-year interaction features
    df['year_round'] = df['year'].astype(str) + '_' + df['round'].astype(str)
    
    # Create rank percentiles by year and round
    df['rank_percentile_by_year_round'] = df.groupby(['year', 'round'])['closing_rank'].rank(pct=True)
    
    # Create competition level features
    df['applications_per_seat'] = df.groupby(['Institute', 'Course', 'year'])['closing_rank'].transform('count')
    
    # Rank trend features (year-on-year comparison)
    df_2023 = df[df['year'] == 2023].groupby(['Institute', 'Course', 'Category', 'Quota'])['closing_rank'].mean().reset_index()
    df_2023.columns = ['Institute', 'Course', 'Category', 'Quota', 'closing_rank_2023']
    
    df_2024 = df[df['year'] == 2024].groupby(['Institute', 'Course', 'Category', 'Quota'])['closing_rank'].mean().reset_index()
    df_2024.columns = ['Institute', 'Course', 'Category', 'Quota', 'closing_rank_2024']
    
    # Merge trends
    df_trend = df_2023.merge(df_2024, on=['Institute', 'Course', 'Category', 'Quota'], how='outer')
    df_trend['rank_trend'] = df_trend['closing_rank_2024'] - df_trend['closing_rank_2023']
    df_trend['rank_trend_pct'] = (df_trend['closing_rank_2024'] - df_trend['closing_rank_2023']) / (df_trend['closing_rank_2023'] + 1)
    
    # Merge back
    df = df.merge(
        df_trend[['Institute', 'Course', 'Category', 'Quota', 'rank_trend', 'rank_trend_pct']],
        on=['Institute', 'Course', 'Category', 'Quota'],
        how='left'
    )
    
    return df, label_encoders

def prepare_modeling_targets(df):
    """Prepare multiple modeling targets"""
    print("Preparing modeling targets...")
    
    # 1. Rank Prediction (Regression)
    df['log_closing_rank'] = np.log(df['closing_rank'] + 1)
    
    # 2. Admission Round Prediction (Classification)
    df['admission_round'] = df['round']
    
    # 3. Admission Probability (Binary Classification)
    # Define admission cutoffs (e.g., rank <= median rank for each combination)
    rank_cutoffs = df.groupby(['Institute', 'Course', 'Category', 'Quota', 'year'])['closing_rank'].median().reset_index()
    rank_cutoffs.columns = ['Institute', 'Course', 'Category', 'Quota', 'year', 'rank_cutoff']
    
    # For this demo, create a synthetic "applicant rank" feature
    # In real scenario, this would come from user input
    np.random.seed(42)
    df['applicant_rank'] = np.random.randint(1, 200000, size=len(df))
    
    # Merge cutoffs
    df = df.merge(rank_cutoffs, on=['Institute', 'Course', 'Category', 'Quota', 'year'], how='left')
    df['gets_admission'] = (df['applicant_rank'] <= df['closing_rank']).astype(int)
    
    # 4. Rank Range Classification (Multi-class)
    df['rank_bracket'] = pd.cut(
        df['closing_rank'], 
        bins=[0, 5000, 15000, 50000, 100000, float('inf')], 
        labels=['Top_5K', '5K_15K', '15K_50K', '50K_100K', 'Above_100K']
    )
    
    return df

def select_features(df):
    """Select features for modeling"""
    
    # Numerical features
    numerical_features = [
        'Annual_Fees', 'Stipend_Year1', 'Bond_Years', 'Bond_Amount', 'Total_Beds',
        'stipend_fee_ratio', 'has_bond', 'mean_closing_rank', 'median_closing_rank',
        'min_closing_rank', 'max_closing_rank', 'std_closing_rank', 'rank_range',
        'competitiveness', 'stability', 'total_rank_records', 'total_rounds',
        'rank_percentile_by_year_round', 'applications_per_seat', 'rank_trend', 'rank_trend_pct',
        'applicant_rank'
    ]
    
    # Encoded categorical features
    categorical_features = [
        'Institute_Type_encoded', 'Course_Type_encoded', 'fee_bracket_encoded',
        'category_main_encoded', 'quota_state_encoded', 'year', 'round'
    ]
    
    # Select available features
    available_features = []
    for feat in numerical_features + categorical_features:
        if feat in df.columns:
            available_features.append(feat)
    
    print(f"Selected {len(available_features)} features for modeling:")
    for feat in available_features:
        print(f"  - {feat}")
    
    return available_features

def train_rank_prediction_model(df, features):
    """Train closing rank prediction model"""
    print("\n=== TRAINING RANK PREDICTION MODEL ===")
    
    # Prepare data
    X = df[features].copy()
    y = df['closing_rank']
    
    # Handle missing values
    X = X.fillna(X.median())
    
    # Time-aware split: train on 2023, test on 2024
    train_mask = df['year'] == 2023
    test_mask = df['year'] == 2024
    
    X_train, X_test = X[train_mask], X[test_mask]
    y_train, y_test = y[train_mask], y[test_mask]
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    if X_train.shape[0] == 0 or X_test.shape[0] == 0:
        print("❌ Insufficient data for time-aware split")
        return None, None
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train LightGBM model
    lgb_train = lgb.Dataset(X_train, label=y_train)
    lgb_valid = lgb.Dataset(X_test, label=y_test, reference=lgb_train)
    
    params = {
        'objective': 'regression',
        'metric': 'rmse',
        'boosting_type': 'gbdt',
        'num_leaves': 100,
        'learning_rate': 0.05,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
        'random_state': 42
    }
    
    model = lgb.train(
        params, 
        lgb_train,
        valid_sets=[lgb_valid],
        num_boost_round=500,
        callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
    )
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Evaluate
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Rank Prediction Results:")
    print(f"  MSE: {mse:.2f}")
    print(f"  MAE: {mae:.2f}")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: {np.sqrt(mse):.2f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importance(importance_type='gain')
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 Important Features:")
    print(feature_importance.head(10))
    
    # Save model
    joblib.dump(model, 'rank_prediction_model.pkl')
    joblib.dump(scaler, 'rank_prediction_scaler.pkl')
    
    return model, scaler

def train_admission_probability_model(df, features):
    """Train admission probability model"""
    print("\n=== TRAINING ADMISSION PROBABILITY MODEL ===")
    
    # Prepare data
    X = df[features].copy()
    y = df['gets_admission']
    
    # Handle missing values
    X = X.fillna(X.median())
    
    # Time-aware split
    train_mask = df['year'] == 2023
    test_mask = df['year'] == 2024
    
    X_train, X_test = X[train_mask], X[test_mask]
    y_train, y_test = y[train_mask], y[test_mask]
    
    if X_train.shape[0] == 0 or X_test.shape[0] == 0:
        print("❌ Insufficient data for time-aware split")
        return None
    
    # Train Random Forest with Calibration
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        class_weight='balanced'
    )
    
    # Calibrate probabilities
    calibrated_model = CalibratedClassifierCV(rf, method='isotonic', cv=3)
    calibrated_model.fit(X_train, y_train)
    
    # Predictions
    y_pred = calibrated_model.predict(X_test)
    y_pred_proba = calibrated_model.predict_proba(X_test)[:, 1]
    
    # Evaluate
    print(f"\nAdmission Probability Results:")
    print(classification_report(y_test, y_pred, target_names=['No Admission', 'Gets Admission']))
    
    # Save model
    joblib.dump(calibrated_model, 'admission_probability_model.pkl')
    
    return calibrated_model

def train_round_prediction_model(df, features):
    """Train admission round prediction model"""
    print("\n=== TRAINING ROUND PREDICTION MODEL ===")
    
    # Prepare data
    X = df[features].copy()
    y = df['admission_round'] - 1  # Convert to 0-based indexing for LightGBM
    
    # Handle missing values
    X = X.fillna(X.median())
    
    # Time-aware split
    train_mask = df['year'] == 2023
    test_mask = df['year'] == 2024
    
    X_train, X_test = X[train_mask], X[test_mask]
    y_train, y_test = y[train_mask], y[test_mask]
    
    if X_train.shape[0] == 0 or X_test.shape[0] == 0:
        print("❌ Insufficient data for time-aware split")
        return None
    
    # Train LightGBM Classifier
    lgb_train = lgb.Dataset(X_train, label=y_train)
    lgb_valid = lgb.Dataset(X_test, label=y_test, reference=lgb_train)
    
    params = {
        'objective': 'multiclass',
        'num_class': len(y.unique()),
        'metric': 'multi_logloss',
        'boosting_type': 'gbdt',
        'num_leaves': 50,
        'learning_rate': 0.05,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
        'random_state': 42
    }
    
    model = lgb.train(
        params, 
        lgb_train,
        valid_sets=[lgb_valid], 
        num_boost_round=300,
        callbacks=[lgb.early_stopping(30), lgb.log_evaluation(0)]
    )
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    
    # Evaluate
    print(f"\nRound Prediction Results:")
    print(classification_report(y_test, y_pred_classes))
    
    # Save model
    joblib.dump(model, 'round_prediction_model.pkl')
    
    return model

def main():
    """Main execution function"""
    print("=== NEET-PG MODEL DEVELOPMENT (FIXED) ===")
    
    # Load and prepare data
    df = load_and_prepare_data()
    
    # Create modeling features
    df, label_encoders = create_modeling_features(df)
    
    # Prepare targets
    df = prepare_modeling_targets(df)
    
    # Select features
    features = select_features(df)
    
    # Save label encoders
    joblib.dump(label_encoders, 'label_encoders.pkl')
    
    print(f"\nFinal modeling dataset shape: {df.shape}")
    print(f"Target variables created:")
    print(f"  - closing_rank (regression)")
    print(f"  - gets_admission (binary classification)")
    print(f"  - admission_round (multi-class classification)")
    
    # Train models
    rank_model, rank_scaler = train_rank_prediction_model(df, features)
    
    admission_model = train_admission_probability_model(df, features)
    
    round_model = train_round_prediction_model(df, features)
    
    # Save sample data for API testing
    print("\nSaving sample data for API testing...")
    sample_data = df.head(100)[features + ['Institute', 'Course', 'Category', 'Quota', 'closing_rank']]
    sample_data.to_csv('sample_api_data.csv', index=False)
    
    print("\n✅ Model development completed successfully!")
    print("Models saved:")
    print("  - rank_prediction_model.pkl")
    print("  - admission_probability_model.pkl") 
    print("  - round_prediction_model.pkl")
    print("  - rank_prediction_scaler.pkl")
    print("  - label_encoders.pkl")
    
    return df

if __name__ == "__main__":
    modeling_df = main()