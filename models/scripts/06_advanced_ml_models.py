#!/usr/bin/env python3
"""
Advanced ML Models Implementation
Includes TabNet, XGBoost, CatBoost, Transformer models, Stacked Ensembles, Quantile Regression
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, StackingRegressor, StackingClassifier
from sklearn.linear_model import QuantileRegressor, LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, classification_report
from sklearn.calibration import CalibratedClassifierCV
import xgboost as xgb
import catboost as cb
import lightgbm as lgb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import joblib
import warnings
warnings.filterwarnings('ignore')

try:
    from pytorch_tabnet.tab_model import TabNetRegressor, TabNetClassifier
    TABNET_AVAILABLE = True
except ImportError:
    print("TabNet not available. Install with: pip install pytorch-tabnet")
    TABNET_AVAILABLE = False

try:
    import optuna
    from optuna.samplers import TPESampler
    OPTUNA_AVAILABLE = True
except ImportError:
    print("Optuna not available. Install with: pip install optuna")
    OPTUNA_AVAILABLE = False

class TransformerTabular(nn.Module):
    """Transformer model for tabular data"""
    
    def __init__(self, input_dim, hidden_dim=128, num_heads=8, num_layers=3, output_dim=1):
        super(TransformerTabular, self).__init__()
        self.input_projection = nn.Linear(input_dim, hidden_dim)
        self.positional_encoding = nn.Parameter(torch.randn(1, 1, hidden_dim))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=0.1,
            activation='relu'
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim // 2, output_dim)
        )
        
    def forward(self, x):
        # Project input to hidden dimension
        x = self.input_projection(x).unsqueeze(1)  # Add sequence dimension
        
        # Add positional encoding
        x = x + self.positional_encoding
        
        # Apply transformer
        x = self.transformer(x)
        
        # Global average pooling and classify
        x = x.mean(dim=1)
        return self.classifier(x)

class AdvancedMLPipeline:
    """Advanced ML pipeline with state-of-the-art models"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.results = {}
        
    def load_and_prepare_data(self):
        """Load and prepare data for advanced modeling"""
        print("=== LOADING DATA FOR ADVANCED ML ===")
        
        # Load prepared features
        try:
            features_df = pd.read_csv('../../data/processed/neet_pg_features_normalized.csv')
        except FileNotFoundError:
            print("Running feature preparation...")
            import subprocess
            subprocess.run(["python", "../../scripts/create_normalized_features.py"], shell=True)
            features_df = pd.read_csv('../../data/processed/neet_pg_features_normalized.csv')
        
        # Load closing ranks
        ranks_df = pd.read_csv('../../data/processed/closing_ranks_long.csv')
        
        # Merge for modeling
        modeling_df = features_df.merge(
            ranks_df,
            on=['Institute', 'Course', 'State', 'Category', 'Quota'],
            how='inner'
        )
        
        print(f"Modeling dataset shape: {modeling_df.shape}")
        return modeling_df
    
    def prepare_features(self, df):
        """Advanced feature engineering for sophisticated models"""
        print("=== ADVANCED FEATURE ENGINEERING ===")
        
        # Encode categorical variables
        categorical_cols = ['Institute_Type', 'Course_Type', 'fee_bracket', 'category_main', 'quota_state']
        
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.encoders[col] = le
        
        # Create interaction features
        df['year_round'] = df['year'].astype(str) + '_' + df['round'].astype(str)
        df['fee_stipend_interaction'] = df['Annual_Fees'] * df['Stipend_Year1']
        df['rank_competition'] = df['closing_rank'] / (df['Total_Beds'] + 1)
        
        # Time-based features
        df['rank_percentile_by_year_round'] = df.groupby(['year', 'round'])['closing_rank'].rank(pct=True)
        df['rank_zscore'] = df.groupby(['year', 'round'])['closing_rank'].transform(lambda x: (x - x.mean()) / x.std())
        
        # Advanced statistical features
        df['rank_log'] = np.log(df['closing_rank'] + 1)
        df['fee_log'] = np.log(df['Annual_Fees'] + 1)
        df['beds_sqrt'] = np.sqrt(df['Total_Beds'] + 1)
        
        # Polynomial features for key variables
        df['rank_squared'] = df['closing_rank'] ** 2
        df['fee_squared'] = df['Annual_Fees'] ** 2
        
        return df
    
    def select_advanced_features(self, df):
        """Select features for advanced models"""
        numerical_features = [
            'Annual_Fees', 'Stipend_Year1', 'Bond_Years', 'Bond_Amount', 'Total_Beds',
            'mean_closing_rank', 'median_closing_rank', 'min_closing_rank', 'max_closing_rank',
            'std_closing_rank', 'rank_range', 'competitiveness', 'stability',
            'rank_percentile_by_year_round', 'rank_zscore', 'rank_log', 'fee_log',
            'beds_sqrt', 'rank_squared', 'fee_squared', 'fee_stipend_interaction',
            'rank_competition', 'year', 'round'
        ]
        
        categorical_features = [
            'Institute_Type_encoded', 'Course_Type_encoded', 'fee_bracket_encoded',
            'category_main_encoded', 'quota_state_encoded'
        ]
        
        # Select available features
        available_features = []
        for feat in numerical_features + categorical_features:
            if feat in df.columns and df[feat].notna().sum() > 100:  # Ensure enough non-null values
                available_features.append(feat)
        
        print(f"Selected {len(available_features)} features for advanced modeling")
        return available_features
    
    def train_xgboost_model(self, X_train, X_test, y_train, y_test, task='regression'):
        """Train XGBoost model with hyperparameter optimization"""
        print("\n=== TRAINING XGBOOST MODEL ===")
        
        if task == 'regression':
            model = xgb.XGBRegressor(
                n_estimators=1000,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        else:
            model = xgb.XGBClassifier(
                n_estimators=1000,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        
        # Train with early stopping
        eval_set = [(X_test, y_test)]
        model.fit(X_train, y_train, eval_set=eval_set, early_stopping_rounds=50, verbose=False)
        
        # Predictions
        y_pred = model.predict(X_test)
        
        # Evaluate
        if task == 'regression':
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            print(f"XGBoost Results - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
            self.results['xgboost'] = {'mse': mse, 'mae': mae, 'r2': r2}
        else:
            print("XGBoost Classification Results:")
            print(classification_report(y_test, y_pred))
        
        return model
    
    def train_catboost_model(self, X_train, X_test, y_train, y_test, task='regression'):
        """Train CatBoost model"""
        print("\n=== TRAINING CATBOOST MODEL ===")
        
        if task == 'regression':
            model = cb.CatBoostRegressor(
                iterations=1000,
                depth=8,
                learning_rate=0.05,
                random_seed=42,
                verbose=False
            )
        else:
            model = cb.CatBoostClassifier(
                iterations=1000,
                depth=8,
                learning_rate=0.05,
                random_seed=42,
                verbose=False
            )
        
        # Train
        model.fit(X_train, y_train, eval_set=(X_test, y_test), early_stopping_rounds=50)
        
        # Predictions
        y_pred = model.predict(X_test)
        
        # Evaluate
        if task == 'regression':
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            print(f"CatBoost Results - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
            self.results['catboost'] = {'mse': mse, 'mae': mae, 'r2': r2}
        else:
            print("CatBoost Classification Results:")
            print(classification_report(y_test, y_pred))
        
        return model
    
    def train_tabnet_model(self, X_train, X_test, y_train, y_test, task='regression'):
        """Train TabNet model"""
        if not TABNET_AVAILABLE:
            print("TabNet not available, skipping...")
            return None
            
        print("\n=== TRAINING TABNET MODEL ===")
        
        # Convert to numpy arrays
        X_train_np = X_train.values if hasattr(X_train, 'values') else X_train
        X_test_np = X_test.values if hasattr(X_test, 'values') else X_test
        y_train_np = y_train.values if hasattr(y_train, 'values') else y_train
        y_test_np = y_test.values if hasattr(y_test, 'values') else y_test
        
        if task == 'regression':
            model = TabNetRegressor(
                n_d=32, n_a=32, n_steps=3,
                gamma=1.3, lambda_sparse=1e-3,
                optimizer_fn=torch.optim.Adam,
                optimizer_params=dict(lr=2e-2),
                mask_type="sparsemax",
                scheduler_params=dict(step_size=10, gamma=0.9),
                scheduler_fn=torch.optim.lr_scheduler.StepLR,
                verbose=0
            )
        else:
            model = TabNetClassifier(
                n_d=32, n_a=32, n_steps=3,
                gamma=1.3, lambda_sparse=1e-3,
                optimizer_fn=torch.optim.Adam,
                optimizer_params=dict(lr=2e-2),
                mask_type="sparsemax",
                scheduler_params=dict(step_size=10, gamma=0.9),
                scheduler_fn=torch.optim.lr_scheduler.StepLR,
                verbose=0
            )
        
        # Train
        model.fit(
            X_train_np, y_train_np,
            eval_set=[(X_test_np, y_test_np)],
            max_epochs=200,
            patience=20,
            batch_size=256,
            virtual_batch_size=128
        )
        
        # Predictions
        y_pred = model.predict(X_test_np)
        
        # Evaluate
        if task == 'regression':
            mse = mean_squared_error(y_test_np, y_pred)
            mae = mean_absolute_error(y_test_np, y_pred)
            r2 = r2_score(y_test_np, y_pred)
            print(f"TabNet Results - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
            self.results['tabnet'] = {'mse': mse, 'mae': mae, 'r2': r2}
        else:
            print("TabNet Classification Results:")
            print(classification_report(y_test_np, y_pred))
        
        return model
    
    def train_transformer_model(self, X_train, X_test, y_train, y_test, task='regression'):
        """Train Transformer model for tabular data"""
        print("\n=== TRAINING TRANSFORMER MODEL ===")
        
        # Convert to tensors
        X_train_tensor = torch.FloatTensor(X_train.values if hasattr(X_train, 'values') else X_train)
        X_test_tensor = torch.FloatTensor(X_test.values if hasattr(X_test, 'values') else X_test)
        y_train_tensor = torch.FloatTensor(y_train.values if hasattr(y_train, 'values') else y_train)
        y_test_tensor = torch.FloatTensor(y_test.values if hasattr(y_test, 'values') else y_test)
        
        if task == 'classification':
            y_train_tensor = y_train_tensor.long()
            y_test_tensor = y_test_tensor.long()
        
        # Create model
        input_dim = X_train_tensor.shape[1]
        output_dim = len(np.unique(y_train)) if task == 'classification' else 1
        
        model = TransformerTabular(
            input_dim=input_dim,
            hidden_dim=128,
            num_heads=8,
            num_layers=3,
            output_dim=output_dim
        )
        
        # Training setup
        criterion = nn.CrossEntropyLoss() if task == 'classification' else nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)
        scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=50, gamma=0.5)
        
        # Create data loaders
        train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
        train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
        
        # Training loop
        model.train()
        for epoch in range(200):
            epoch_loss = 0
            for batch_X, batch_y in train_loader:
                optimizer.zero_grad()
                outputs = model(batch_X)
                
                if task == 'classification':
                    loss = criterion(outputs, batch_y)
                else:
                    loss = criterion(outputs.squeeze(), batch_y)
                
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
            
            scheduler.step()
            
            if epoch % 50 == 0:
                print(f"Epoch {epoch}, Loss: {epoch_loss/len(train_loader):.4f}")
        
        # Evaluation
        model.eval()
        with torch.no_grad():
            y_pred = model(X_test_tensor)
            
            if task == 'regression':
                y_pred = y_pred.squeeze().numpy()
                y_test_np = y_test_tensor.numpy()
                
                mse = mean_squared_error(y_test_np, y_pred)
                mae = mean_absolute_error(y_test_np, y_pred)
                r2 = r2_score(y_test_np, y_pred)
                print(f"Transformer Results - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
                self.results['transformer'] = {'mse': mse, 'mae': mae, 'r2': r2}
            else:
                y_pred = torch.softmax(y_pred, dim=1).numpy()
                y_pred_classes = np.argmax(y_pred, axis=1)
                print("Transformer Classification Results:")
                print(classification_report(y_test_tensor.numpy(), y_pred_classes))
        
        return model
    
    def create_stacked_ensemble(self, X_train, X_test, y_train, y_test, task='regression'):
        """Create stacked ensemble combining all models"""
        print("\n=== CREATING STACKED ENSEMBLE ===")
        
        base_models = []
        
        # Add base models
        base_models.append(('lgb', lgb.LGBMRegressor(random_state=42, verbose=-1) if task == 'regression' 
                          else lgb.LGBMClassifier(random_state=42, verbose=-1)))
        base_models.append(('xgb', xgb.XGBRegressor(random_state=42, n_jobs=-1) if task == 'regression'
                          else xgb.XGBClassifier(random_state=42, n_jobs=-1)))
        base_models.append(('cb', cb.CatBoostRegressor(verbose=False, random_seed=42) if task == 'regression'
                          else cb.CatBoostClassifier(verbose=False, random_seed=42)))
        base_models.append(('rf', RandomForestRegressor(random_state=42, n_jobs=-1) if task == 'regression'
                          else RandomForestClassifier(random_state=42, n_jobs=-1)))
        
        # Meta-learner
        meta_model = LinearRegression() if task == 'regression' else RandomForestClassifier(random_state=42)
        
        # Create stacked ensemble
        if task == 'regression':
            ensemble = StackingRegressor(
                estimators=base_models,
                final_estimator=meta_model,
                cv=5
            )
        else:
            ensemble = StackingClassifier(
                estimators=base_models,
                final_estimator=meta_model,
                cv=5
            )
        
        # Train ensemble
        ensemble.fit(X_train, y_train)
        
        # Predictions
        y_pred = ensemble.predict(X_test)
        
        # Evaluate
        if task == 'regression':
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            print(f"Stacked Ensemble Results - MSE: {mse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
            self.results['ensemble'] = {'mse': mse, 'mae': mae, 'r2': r2}
        else:
            print("Stacked Ensemble Classification Results:")
            print(classification_report(y_test, y_pred))
        
        return ensemble
    
    def train_quantile_regression(self, X_train, X_test, y_train, y_test):
        """Train quantile regression for confidence intervals"""
        print("\n=== TRAINING QUANTILE REGRESSION ===")
        
        quantiles = [0.1, 0.25, 0.5, 0.75, 0.9]
        quantile_models = {}
        
        for q in quantiles:
            print(f"Training quantile {q}...")
            model = QuantileRegressor(quantile=q, alpha=0.01, solver='highs')
            model.fit(X_train, y_train)
            quantile_models[q] = model
        
        # Generate predictions for all quantiles
        predictions = {}
        for q, model in quantile_models.items():
            predictions[q] = model.predict(X_test)
        
        # Calculate coverage and interval width
        lower_bound = predictions[0.1]
        upper_bound = predictions[0.9]
        median_pred = predictions[0.5]
        
        # Coverage (percentage of actual values within prediction interval)
        coverage = np.mean((y_test >= lower_bound) & (y_test <= upper_bound))
        
        # Average interval width
        avg_width = np.mean(upper_bound - lower_bound)
        
        print(f"Quantile Regression Results:")
        print(f"  80% Prediction Interval Coverage: {coverage:.3f}")
        print(f"  Average Interval Width: {avg_width:.2f}")
        print(f"  Median Prediction MAE: {mean_absolute_error(y_test, median_pred):.2f}")
        
        self.results['quantile'] = {
            'coverage': coverage,
            'avg_width': avg_width,
            'median_mae': mean_absolute_error(y_test, median_pred)
        }
        
        return quantile_models
    
    def optimize_hyperparameters(self, X_train, y_train, model_type='xgboost'):
        """Bayesian hyperparameter optimization using Optuna"""
        if not OPTUNA_AVAILABLE:
            print("Optuna not available for hyperparameter optimization")
            return None
            
        print(f"\n=== OPTIMIZING {model_type.upper()} HYPERPARAMETERS ===")
        
        def objective(trial):
            if model_type == 'xgboost':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 100, 2000),
                    'max_depth': trial.suggest_int('max_depth', 3, 12),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                    'reg_alpha': trial.suggest_float('reg_alpha', 0, 10),
                    'reg_lambda': trial.suggest_float('reg_lambda', 0, 10),
                }
                model = xgb.XGBRegressor(**params, random_state=42, n_jobs=-1)
                
            elif model_type == 'catboost':
                params = {
                    'iterations': trial.suggest_int('iterations', 100, 2000),
                    'depth': trial.suggest_int('depth', 3, 12),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'l2_leaf_reg': trial.suggest_float('l2_leaf_reg', 1, 10),
                }
                model = cb.CatBoostRegressor(**params, random_seed=42, verbose=False)
            
            # Cross-validation
            scores = cross_val_score(model, X_train, y_train, cv=3, scoring='neg_mean_squared_error')
            return -scores.mean()
        
        study = optuna.create_study(direction='minimize', sampler=TPESampler())
        study.optimize(objective, n_trials=100)
        
        print(f"Best parameters: {study.best_params}")
        print(f"Best score: {study.best_value:.4f}")
        
        return study.best_params
    
    def run_complete_pipeline(self):
        """Run the complete advanced ML pipeline"""
        print("=== STARTING ADVANCED ML PIPELINE ===")
        
        # Load and prepare data
        df = self.load_and_prepare_data()
        df = self.prepare_features(df)
        features = self.select_advanced_features(df)
        
        # Prepare modeling data
        X = df[features].copy()
        y_regression = df['closing_rank']
        y_classification = (df['closing_rank'] <= df['closing_rank'].median()).astype(int)
        
        # Handle missing values
        X = X.fillna(X.median())
        
        # Time-aware split
        train_mask = df['year'] == 2023
        test_mask = df['year'] == 2024
        
        X_train, X_test = X[train_mask], X[test_mask]
        y_reg_train, y_reg_test = y_regression[train_mask], y_regression[test_mask]
        y_cls_train, y_cls_test = y_classification[train_mask], y_classification[test_mask]
        
        if len(X_train) == 0 or len(X_test) == 0:
            print("❌ Insufficient data for time-aware split")
            return
        
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # Scale features for some models
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['standard'] = scaler
        
        # Train all advanced models
        print("\n" + "="*50)
        print("TRAINING ADVANCED ML MODELS")
        print("="*50)
        
        # XGBoost
        self.models['xgboost_reg'] = self.train_xgboost_model(
            X_train, X_test, y_reg_train, y_reg_test, 'regression'
        )
        
        # CatBoost
        self.models['catboost_reg'] = self.train_catboost_model(
            X_train, X_test, y_reg_train, y_reg_test, 'regression'
        )
        
        # TabNet
        if TABNET_AVAILABLE:
            self.models['tabnet_reg'] = self.train_tabnet_model(
                X_train_scaled, X_test_scaled, y_reg_train, y_reg_test, 'regression'
            )
        
        # Transformer
        self.models['transformer_reg'] = self.train_transformer_model(
            X_train_scaled, X_test_scaled, y_reg_train, y_reg_test, 'regression'
        )
        
        # Stacked Ensemble
        self.models['ensemble_reg'] = self.create_stacked_ensemble(
            X_train, X_test, y_reg_train, y_reg_test, 'regression'
        )
        
        # Quantile Regression
        self.models['quantile'] = self.train_quantile_regression(
            X_train_scaled, X_test_scaled, y_reg_train, y_reg_test
        )
        
        # Hyperparameter optimization
        if OPTUNA_AVAILABLE:
            best_xgb_params = self.optimize_hyperparameters(X_train, y_reg_train, 'xgboost')
            best_cb_params = self.optimize_hyperparameters(X_train, y_reg_train, 'catboost')
            
            # Train optimized models
            if best_xgb_params:
                optimized_xgb = xgb.XGBRegressor(**best_xgb_params, random_state=42)
                optimized_xgb.fit(X_train, y_reg_train)
                self.models['xgboost_optimized'] = optimized_xgb
                
            if best_cb_params:
                optimized_cb = cb.CatBoostRegressor(**best_cb_params, random_seed=42, verbose=False)
                optimized_cb.fit(X_train, y_reg_train)
                self.models['catboost_optimized'] = optimized_cb
        
        # Save all models
        self.save_models()
        
        # Print results summary
        self.print_results_summary()
        
        print("\n✅ Advanced ML pipeline completed successfully!")
        return self.models, self.results
    
    def save_models(self):
        """Save all trained models"""
        print("\n=== SAVING ADVANCED MODELS ===")
        
        # Save traditional models
        for name, model in self.models.items():
            if model is not None and name != 'quantile':
                try:
                    if 'torch' in str(type(model)) or 'transformer' in name.lower():
                        torch.save(model.state_dict(), f'../trained/{name}_model.pth')
                        print(f"Saved {name} model (PyTorch)")
                    elif hasattr(model, 'save_model'):
                        model.save_model(f'../trained/{name}_model.json')
                        print(f"Saved {name} model (JSON)")
                    else:
                        joblib.dump(model, f'../trained/{name}_model.pkl')
                        print(f"Saved {name} model (Pickle)")
                except Exception as e:
                    print(f"Failed to save {name}: {e}")
        
        # Save quantile models separately
        if 'quantile' in self.models and self.models['quantile']:
            joblib.dump(self.models['quantile'], '../trained/quantile_models.pkl')
            print("Saved quantile regression models")
        
        # Save encoders and scalers
        joblib.dump(self.encoders, '../trained/advanced_encoders.pkl')
        joblib.dump(self.scalers, '../trained/advanced_scalers.pkl')
        joblib.dump(self.results, '../../data/processed/advanced_results.pkl')
        
    def print_results_summary(self):
        """Print comprehensive results summary"""
        print("\n" + "="*50)
        print("ADVANCED ML MODELS RESULTS SUMMARY")
        print("="*50)
        
        if not self.results:
            print("No results to display")
            return
        
        # Sort models by R² score for regression
        regression_results = {k: v for k, v in self.results.items() 
                            if isinstance(v, dict) and 'r2' in v}
        
        if regression_results:
            sorted_models = sorted(regression_results.items(), 
                                 key=lambda x: x[1]['r2'], reverse=True)
            
            print(f"{'Model':<20} {'R²':<10} {'RMSE':<10} {'MAE':<10}")
            print("-" * 50)
            
            for model_name, results in sorted_models:
                r2 = results['r2']
                rmse = np.sqrt(results['mse'])
                mae = results['mae']
                print(f"{model_name:<20} {r2:<10.4f} {rmse:<10.2f} {mae:<10.2f}")
        
        # Special results
        if 'quantile' in self.results:
            qr = self.results['quantile']
            print(f"\nQuantile Regression:")
            print(f"  80% Coverage: {qr['coverage']:.3f}")
            print(f"  Avg Width: {qr['avg_width']:.2f}")

def main():
    """Main execution function"""
    pipeline = AdvancedMLPipeline()
    models, results = pipeline.run_complete_pipeline()
    
    return pipeline

if __name__ == "__main__":
    pipeline = main()