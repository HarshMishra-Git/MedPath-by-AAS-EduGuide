#!/usr/bin/env python3
"""
NEET-PG College Finder - Model Development
==========================================
Advanced machine learning models for college ranking and prediction.
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import GroupKFold, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, precision_recall_curve, roc_auc_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb
import warnings
warnings.filterwarnings('ignore')

# Import optional dependencies
try:
    import optuna
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False
    print("⚠️ Optuna not available. Using default hyperparameters.")

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available. Skipping deep learning models.")

class NEETPGModelDeveloper:
    """Production-grade machine learning pipeline for NEET-PG college finder"""
    
    def __init__(self, random_state=42):
        self.random_state = random_state
        np.random.seed(random_state)
        
        # Models storage
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.feature_names = None
        
        # Performance metrics
        self.results = {}
        
    def load_features_and_targets(self):
        """Load engineered features and create targets"""
        print("📊 Loading features and targets...")
        
        # Load features
        features_df = pd.read_csv('../../data/processed/neet_pg_features.csv')
        cr_long = pd.read_csv('../../data/processed/closing_ranks_long.csv')
        
        print(f"✅ Features loaded: {features_df.shape[0]:,} rows × {features_df.shape[1]} columns")
        print(f"✅ Closing ranks: {len(cr_long):,} records")
        
        return features_df, cr_long
    
    def create_modeling_targets(self, features_df, cr_long, candidate_air=50000):
        """Create comprehensive targets for different modeling tasks"""
        print(f"\n🎯 CREATING MODELING TARGETS (Candidate AIR: {candidate_air:,})")
        
        # Get latest closing ranks (2024 as ground truth)
        latest_ranks = cr_long[cr_long['year'] == 2024].groupby(
            ['Institute', 'Course', 'Quota', 'Category']
        )['closing_rank'].agg(['median', 'min', 'max', 'mean', 'count']).reset_index()
        
        # Create base dataset with features
        modeling_df = features_df.merge(
            latest_ranks, 
            on=['Institute', 'Course', 'Quota', 'Category'], 
            how='inner'
        )
        
        print(f"✅ Merged dataset: {len(modeling_df):,} records with valid closing ranks")
        
        # TARGET 1: Binary Admission Probability
        modeling_df['admission_target'] = (modeling_df['median'] >= candidate_air).astype(int)
        
        # TARGET 2: Closing Rank Prediction (Regression)
        modeling_df['rank_target'] = modeling_df['median']
        
        # TARGET 3: Rank Percentile (0-100 scale)
        modeling_df['rank_percentile'] = modeling_df['median'].rank(pct=True) * 100
        
        # TARGET 4: Admission Difficulty (5 categories)
        modeling_df['difficulty_category'] = pd.cut(
            modeling_df['median'],
            bins=[0, 10000, 25000, 50000, 100000, np.inf],
            labels=['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard']
        )
        
        # Add ranking features for Learn-to-Rank
        # Group by applicant characteristics and rank colleges
        modeling_df['group_id'] = (
            modeling_df['applicant_candidate_state'].astype(str) + '_' +
            modeling_df['Category'].astype(str) + '_' +
            modeling_df['Quota'].astype(str)
        )
        
        # Rank within each group (lower rank = better college for the applicant)
        modeling_df['relevance_score'] = modeling_df.groupby('group_id')['median'].rank(ascending=True)
        modeling_df['relevance_binary'] = (modeling_df['relevance_score'] <= modeling_df.groupby('group_id')['relevance_score'].transform('quantile', 0.3)).astype(int)
        
        print(f"📈 Target distributions:")
        print(f"   - Admission probability: {modeling_df['admission_target'].mean():.2%} positive rate")
        print(f"   - Median closing rank: {modeling_df['rank_target'].median():,.0f}")
        print(f"   - Difficulty categories: {modeling_df['difficulty_category'].value_counts().to_dict()}")
        
        return modeling_df
    
    def prepare_features(self, modeling_df):
        """Prepare features for machine learning"""
        print("\n🔧 PREPARING FEATURES...")
        
        # Separate categorical and numerical features
        categorical_cols = modeling_df.select_dtypes(include=['object']).columns
        numerical_cols = modeling_df.select_dtypes(include=[np.number]).columns
        
        # Remove target columns and IDs from features
        target_cols = ['admission_target', 'rank_target', 'rank_percentile', 'difficulty_category', 
                      'relevance_score', 'relevance_binary', 'group_id', 'median', 'min', 'max', 'mean', 'count']
        
        feature_cols = [col for col in modeling_df.columns if col not in target_cols]
        
        # Encode categorical features
        X = modeling_df[feature_cols].copy()
        
        for col in categorical_cols:
            if col in X.columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.label_encoders[col] = le
        
        # Handle missing values
        X = X.fillna(X.median())
        
        self.feature_names = X.columns.tolist()
        print(f"✅ Prepared {len(self.feature_names)} features")
        
        return X
    
    def create_time_aware_splits(self, modeling_df, X):
        """Create time-aware train/validation/test splits"""
        print("\n📅 CREATING TIME-AWARE SPLITS...")
        
        # Use 2023 data for training, 2024 for testing
        cr_long = pd.read_csv('../../data/processed/closing_ranks_long.csv')
        
        # Get records with historical data
        train_mask = modeling_df['Institute'].isin(
            cr_long[cr_long['year'] == 2023]['Institute'].unique()
        )
        
        X_train = X[train_mask]
        X_test = X[~train_mask]
        
        # If we have limited 2024-only data, use a different approach
        if len(X_test) < 1000:
            # Use random split but prioritize more recent data patterns
            X_train, X_test = train_test_split(X, test_size=0.2, random_state=self.random_state)
        
        # Further split training into train/validation
        X_train, X_val = train_test_split(X_train, test_size=0.25, random_state=self.random_state)
        
        print(f"✅ Data splits created:")
        print(f"   - Training: {len(X_train):,} samples")
        print(f"   - Validation: {len(X_val):,} samples") 
        print(f"   - Testing: {len(X_test):,} samples")
        
        return X_train, X_val, X_test, train_mask
    
    def train_lightgbm_ranker(self, X_train, X_val, y_train, y_val, group_train=None, group_val=None):
        """Train LightGBM ranker for college recommendations"""
        print("\n🚀 TRAINING LIGHTGBM RANKER...")
        
        # LightGBM parameters for ranking
        params = {
            'objective': 'lambdarank',
            'metric': 'ndcg',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'random_state': self.random_state
        }
        
        # Create datasets
        train_data = lgb.Dataset(X_train, label=y_train, group=group_train)
        val_data = lgb.Dataset(X_val, label=y_val, group=group_val, reference=train_data)
        
        # Train model
        model = lgb.train(
            params,
            train_data,
            num_boost_round=1000,
            valid_sets=[val_data],
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        
        self.models['lgb_ranker'] = model
        print("✅ LightGBM ranker trained")
        
        return model
    
    def train_regression_models(self, X_train, X_val, X_test, y_train, y_val, y_test):
        """Train regression models for closing rank prediction"""
        print("\n📈 TRAINING REGRESSION MODELS...")
        
        models = {}
        results = {}
        
        # 1. LightGBM Regressor
        lgb_reg_params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'random_state': self.random_state
        }
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        lgb_reg = lgb.train(
            lgb_reg_params,
            train_data,
            num_boost_round=1000,
            valid_sets=[val_data],
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        
        models['lgb_regressor'] = lgb_reg
        
        # 2. Random Forest Regressor
        rf_reg = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        rf_reg.fit(X_train, y_train)
        models['rf_regressor'] = rf_reg
        
        # Evaluate models
        for name, model in models.items():
            if name == 'lgb_regressor':
                y_pred = model.predict(X_test)
            else:
                y_pred = model.predict(X_test)
            
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            results[name] = {'MAE': mae, 'RMSE': rmse, 'R2': r2}
            print(f"✅ {name}: MAE={mae:.0f}, RMSE={rmse:.0f}, R²={r2:.3f}")
        
        self.models.update(models)
        self.results['regression'] = results
        
        return models, results
    
    def train_classification_models(self, X_train, X_val, X_test, y_train, y_val, y_test):
        """Train classification models for admission probability"""
        print("\n🎯 TRAINING CLASSIFICATION MODELS...")
        
        models = {}
        results = {}
        
        # 1. LightGBM Classifier
        lgb_clf_params = {
            'objective': 'binary',
            'metric': 'binary_logloss',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'random_state': self.random_state
        }
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        lgb_clf = lgb.train(
            lgb_clf_params,
            train_data,
            num_boost_round=1000,
            valid_sets=[val_data],
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        
        models['lgb_classifier'] = lgb_clf
        
        # 2. Random Forest Classifier with Calibration
        rf_clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Calibrate classifier
        calibrated_rf = CalibratedClassifierCV(rf_clf, method='isotonic', cv=3)
        calibrated_rf.fit(X_train, y_train)
        models['calibrated_rf'] = calibrated_rf
        
        # Evaluate models
        for name, model in models.items():
            if name == 'lgb_classifier':
                y_prob = model.predict(X_test)
                y_pred = (y_prob > 0.5).astype(int)
            else:
                y_prob = model.predict_proba(X_test)[:, 1]
                y_pred = model.predict(X_test)
            
            accuracy = accuracy_score(y_test, y_pred)
            auc = roc_auc_score(y_test, y_prob)
            
            results[name] = {'Accuracy': accuracy, 'AUC': auc}
            print(f"✅ {name}: Accuracy={accuracy:.3f}, AUC={auc:.3f}")
        
        self.models.update(models)
        self.results['classification'] = results
        
        return models, results
    
    def train_deep_learning_model(self, X_train, X_val, y_train, y_val):
        """Train neural network for tabular data"""
        if not TORCH_AVAILABLE:
            print("⚠️ PyTorch not available. Skipping deep learning model.")
            return None, {}
        
        print("\n🧠 TRAINING DEEP LEARNING MODEL...")
        
        # Normalize features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)
        
        self.scalers['deep_model_scaler'] = scaler
        
        # Convert to PyTorch tensors
        X_train_tensor = torch.FloatTensor(X_train_scaled)
        y_train_tensor = torch.FloatTensor(y_train.values)
        X_val_tensor = torch.FloatTensor(X_val_scaled)
        y_val_tensor = torch.FloatTensor(y_val.values)
        
        # Create datasets and dataloaders
        train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
        val_dataset = TensorDataset(X_val_tensor, y_val_tensor)
        
        train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)
        
        # Define neural network
        class TabularNN(nn.Module):
            def __init__(self, input_size, hidden_sizes=[512, 256, 128], dropout_rate=0.3):
                super(TabularNN, self).__init__()
                
                layers = []
                prev_size = input_size
                
                for hidden_size in hidden_sizes:
                    layers.extend([
                        nn.Linear(prev_size, hidden_size),
                        nn.BatchNorm1d(hidden_size),
                        nn.ReLU(),
                        nn.Dropout(dropout_rate)
                    ])
                    prev_size = hidden_size
                
                layers.append(nn.Linear(prev_size, 1))
                self.network = nn.Sequential(*layers)
            
            def forward(self, x):
                return self.network(x).squeeze()
        
        # Initialize model
        model = TabularNN(input_size=X_train.shape[1])
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)
        
        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0
        
        for epoch in range(200):
            # Training
            model.train()
            train_loss = 0
            for X_batch, y_batch in train_loader:
                optimizer.zero_grad()
                outputs = model(X_batch)
                loss = criterion(outputs, y_batch)
                loss.backward()
                optimizer.step()
                train_loss += loss.item()
            
            # Validation
            model.eval()
            val_loss = 0
            with torch.no_grad():
                for X_batch, y_batch in val_loader:
                    outputs = model(X_batch)
                    loss = criterion(outputs, y_batch)
                    val_loss += loss.item()
            
            val_loss /= len(val_loader)
            scheduler.step(val_loss)
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                torch.save(model.state_dict(), '../trained/best_deep_model.pth')
            else:
                patience_counter += 1
                
            if patience_counter >= 20:
                break
            
            if epoch % 20 == 0:
                print(f"Epoch {epoch}: Train Loss={train_loss/len(train_loader):.4f}, Val Loss={val_loss:.4f}")
        
        # Load best model
        model.load_state_dict(torch.load('../trained/best_deep_model.pth'))
        
        self.models['deep_model'] = model
        print(f"✅ Deep learning model trained. Best validation loss: {best_val_loss:.4f}")
        
        return model, {'best_val_loss': best_val_loss}
    
    def save_models(self):
        """Save all trained models"""
        print("\n💾 SAVING MODELS...")
        
        # Save traditional ML models
        for name, model in self.models.items():
            if name not in ['deep_model']:
                joblib.dump(model, f'../trained/model_{name}.pkl')
                print(f"✅ Saved {name}")
        
        # Save encoders and scalers
        if self.label_encoders:
            joblib.dump(self.label_encoders, '../trained/label_encoders.pkl')
            print("✅ Saved label encoders")
        
        if self.scalers:
            joblib.dump(self.scalers, '../trained/scalers.pkl')
            print("✅ Saved scalers")
        
        # Save feature names
        joblib.dump(self.feature_names, '../trained/feature_names.pkl')
        print("✅ Saved feature names")
        
        # Save results
        pd.DataFrame(self.results).to_csv('../../data/processed/model_results.csv')
        print("✅ Saved model results")
    
    def develop_models(self, candidate_air=50000):
        """Main model development pipeline"""
        print("=" * 80)
        print("NEET-PG MODEL DEVELOPMENT PIPELINE")
        print("=" * 80)
        
        # Load data
        features_df, cr_long = self.load_features_and_targets()
        
        # Create targets
        modeling_df = self.create_modeling_targets(features_df, cr_long, candidate_air)
        
        # Prepare features
        X = self.prepare_features(modeling_df)
        
        # Create time-aware splits
        X_train, X_val, X_test, train_mask = self.create_time_aware_splits(modeling_df, X)
        
        # Get corresponding targets
        y_regression_train = modeling_df[train_mask]['rank_target'].iloc[:len(X_train)]
        y_regression_val = modeling_df[train_mask]['rank_target'].iloc[len(X_train):len(X_train)+len(X_val)]
        y_regression_test = modeling_df[~train_mask]['rank_target'].iloc[:len(X_test)] if len(modeling_df[~train_mask]) > 0 else modeling_df['rank_target'].iloc[-len(X_test):]
        
        y_classification_train = modeling_df[train_mask]['admission_target'].iloc[:len(X_train)]
        y_classification_val = modeling_df[train_mask]['admission_target'].iloc[len(X_train):len(X_train)+len(X_val)]
        y_classification_test = modeling_df[~train_mask]['admission_target'].iloc[:len(X_test)] if len(modeling_df[~train_mask]) > 0 else modeling_df['admission_target'].iloc[-len(X_test):]
        
        # Train regression models
        self.train_regression_models(X_train, X_val, X_test, y_regression_train, y_regression_val, y_regression_test)
        
        # Train classification models
        self.train_classification_models(X_train, X_val, X_test, y_classification_train, y_classification_val, y_classification_test)
        
        # Train deep learning model
        self.train_deep_learning_model(X_train, X_val, y_regression_train, y_regression_val)
        
        # Save models
        self.save_models()
        
        print(f"\n🎯 MODEL DEVELOPMENT COMPLETED!")
        print(f"   🤖 Models trained: {len(self.models)}")
        print(f"   📊 Features used: {len(self.feature_names)}")
        print(f"   💾 Models saved to disk")
        
        return self.models, self.results

if __name__ == "__main__":
    developer = NEETPGModelDeveloper()
    
    # Develop models for different AIR scenarios
    candidate_air = 35000  # Example candidate AIR
    
    models, results = developer.develop_models(candidate_air=candidate_air)
    
    print(f"\n🏆 FINAL RESULTS:")
    for task, task_results in results.items():
        print(f"\n{task.upper()}:")
        for model_name, metrics in task_results.items():
            print(f"  {model_name}: {metrics}")