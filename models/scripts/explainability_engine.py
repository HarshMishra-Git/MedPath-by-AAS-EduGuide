#!/usr/bin/env python3
"""
NEET-PG Explainability Engine
============================
Comprehensive model interpretability using SHAP, LIME, and custom explanations
"""

import pandas as pd
import numpy as np
import shap
import lime
import lime.tabular
import joblib
import json
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from typing import Dict, List, Any, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class ExplainabilityEngine:
    """Comprehensive model explainability engine"""
    
    def __init__(self, models_dir: str = "."):
        """Initialize with trained models and data"""
        self.models_dir = models_dir
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.explainers = {}
        self.feature_names = None
        self.training_data = None
        self.load_models()
        
    def load_models(self):
        """Load all trained models and preprocessing components"""
        try:
            # Load models
            self.models['rank_prediction'] = joblib.load(f'{self.models_dir}/rank_prediction_model.pkl')
            self.models['admission_probability'] = joblib.load(f'{self.models_dir}/admission_probability_model.pkl')
            self.models['round_prediction'] = joblib.load(f'{self.models_dir}/round_prediction_model.pkl')
            
            # Load preprocessing components
            self.scalers['rank_prediction'] = joblib.load(f'{self.models_dir}/rank_prediction_scaler.pkl')
            self.encoders = joblib.load(f'{self.models_dir}/label_encoders.pkl')
            
            # Load sample data for explanations
            self.training_data = pd.read_csv(f'{self.models_dir}/sample_api_data.csv')
            
            # Initialize explainers
            self._initialize_explainers()
            
            print("✅ All models and explainers loaded successfully")
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise
    
    def _initialize_explainers(self):
        """Initialize SHAP and LIME explainers for each model"""
        try:
            # Get feature columns
            feature_cols = [col for col in self.training_data.columns 
                           if col not in ['Institute', 'Course', 'Category', 'Quota', 'closing_rank']]
            self.feature_names = feature_cols
            
            # Prepare training data for explainers
            X_train = self.training_data[feature_cols].fillna(0)
            
            # Initialize SHAP explainers
            print("Initializing SHAP explainers...")
            
            # For LightGBM models
            if hasattr(self.models['rank_prediction'], 'predict'):
                self.explainers['shap_rank'] = shap.TreeExplainer(self.models['rank_prediction'])
            
            if hasattr(self.models['round_prediction'], 'predict'):
                self.explainers['shap_round'] = shap.TreeExplainer(self.models['round_prediction'])
            
            # For sklearn models (admission probability)
            self.explainers['shap_admission'] = shap.Explainer(
                self.models['admission_probability'].predict_proba, X_train.values
            )
            
            # Initialize LIME explainers
            print("Initializing LIME explainers...")
            self.explainers['lime'] = lime.tabular.LimeTabularExplainer(
                X_train.values,
                feature_names=feature_cols,
                class_names=['No Admission', 'Gets Admission'],
                mode='classification'
            )
            
            print("✅ All explainers initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing explainers: {e}")
            
    def explain_prediction(self, candidate_features: Dict[str, Any], 
                         prediction_type: str = 'all') -> Dict[str, Any]:
        """Generate comprehensive explanation for a prediction"""
        try:
            # Prepare features
            feature_vector = self._prepare_features(candidate_features)
            
            explanations = {
                'input_features': candidate_features,
                'processed_features': feature_vector.tolist(),
                'feature_names': self.feature_names
            }
            
            if prediction_type in ['all', 'rank_prediction']:
                explanations['rank_explanation'] = self._explain_rank_prediction(feature_vector)
            
            if prediction_type in ['all', 'admission_probability']:
                explanations['admission_explanation'] = self._explain_admission_prediction(feature_vector)
            
            if prediction_type in ['all', 'round_prediction']:
                explanations['round_explanation'] = self._explain_round_prediction(feature_vector)
            
            # Add global explanations
            explanations['global_importance'] = self._get_global_feature_importance()
            
            # Add counterfactual analysis
            explanations['counterfactuals'] = self._generate_counterfactuals(feature_vector, candidate_features)
            
            return explanations
            
        except Exception as e:
            print(f"❌ Error in explain_prediction: {e}")
            return {'error': str(e)}
    
    def _prepare_features(self, candidate_features: Dict[str, Any]) -> np.ndarray:
        """Convert candidate features to model input format"""
        # This should match the feature engineering pipeline
        # For now, using a simplified approach
        feature_vector = np.zeros(len(self.feature_names))
        
        # Map known features to vector positions
        feature_mapping = {
            'Annual_Fees': candidate_features.get('annual_fees', 0),
            'Stipend_Year1': candidate_features.get('stipend_year1', 0),
            'Bond_Years': candidate_features.get('bond_years', 0),
            'Bond_Amount': candidate_features.get('bond_amount', 0),
            'Total_Beds': candidate_features.get('total_beds', 0),
            'applicant_rank': candidate_features.get('air', 50000),
            'year': 2024,  # Default to current year
            'round': candidate_features.get('round', 1)
        }
        
        for i, feature_name in enumerate(self.feature_names):
            if feature_name in feature_mapping:
                feature_vector[i] = feature_mapping[feature_name]
        
        return feature_vector.reshape(1, -1)
    
    def _explain_rank_prediction(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """Explain rank prediction using SHAP"""
        try:
            # Get prediction
            prediction = self.models['rank_prediction'].predict(feature_vector)[0]
            
            # Get SHAP values
            if 'shap_rank' in self.explainers:
                shap_values = self.explainers['shap_rank'].shap_values(feature_vector)
                
                # Create explanation
                explanation = {
                    'predicted_rank': float(prediction),
                    'shap_values': shap_values[0].tolist(),
                    'base_value': float(self.explainers['shap_rank'].expected_value),
                    'feature_contributions': []
                }
                
                # Sort features by importance
                feature_importance = [(self.feature_names[i], shap_values[0][i]) 
                                    for i in range(len(self.feature_names))]
                feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
                
                explanation['feature_contributions'] = [
                    {'feature': feat, 'contribution': float(contrib), 
                     'impact': 'positive' if contrib > 0 else 'negative'}
                    for feat, contrib in feature_importance[:10]
                ]
                
                return explanation
            
        except Exception as e:
            return {'error': f'Rank explanation error: {e}'}
        
        return {'error': 'SHAP explainer not available for rank prediction'}
    
    def _explain_admission_prediction(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """Explain admission probability using SHAP and LIME"""
        try:
            # Get prediction
            probabilities = self.models['admission_probability'].predict_proba(feature_vector)[0]
            prediction = self.models['admission_probability'].predict(feature_vector)[0]
            
            explanation = {
                'predicted_probability': float(probabilities[1]),
                'predicted_class': int(prediction),
                'class_probabilities': {
                    'no_admission': float(probabilities[0]),
                    'gets_admission': float(probabilities[1])
                }
            }
            
            # SHAP explanation
            if 'shap_admission' in self.explainers:
                shap_values = self.explainers['shap_admission'](feature_vector)
                
                explanation['shap_values'] = shap_values[0][:, 1].tolist()  # For positive class
                explanation['base_value'] = float(shap_values.base_values[0][1])
                
                # Feature contributions
                feature_importance = [(self.feature_names[i], shap_values[0][i, 1]) 
                                    for i in range(len(self.feature_names))]
                feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
                
                explanation['feature_contributions'] = [
                    {'feature': feat, 'contribution': float(contrib),
                     'impact': 'increases_probability' if contrib > 0 else 'decreases_probability'}
                    for feat, contrib in feature_importance[:10]
                ]
            
            # LIME explanation
            try:
                lime_explanation = self.explainers['lime'].explain_instance(
                    feature_vector[0], 
                    self.models['admission_probability'].predict_proba,
                    num_features=10
                )
                
                explanation['lime_features'] = [
                    {'feature': feat, 'weight': weight}
                    for feat, weight in lime_explanation.as_list()
                ]
                
            except Exception as e:
                explanation['lime_error'] = str(e)
            
            return explanation
            
        except Exception as e:
            return {'error': f'Admission explanation error: {e}'}
    
    def _explain_round_prediction(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """Explain round prediction using SHAP"""
        try:
            # Get prediction
            if hasattr(self.models['round_prediction'], 'predict'):
                probabilities = self.models['round_prediction'].predict(feature_vector)
                predicted_round = int(np.argmax(probabilities[0])) + 1  # Convert back to 1-based
            else:
                predicted_round = 1
                probabilities = [[1.0]]
            
            explanation = {
                'predicted_round': predicted_round,
                'round_probabilities': {
                    f'round_{i+1}': float(prob) 
                    for i, prob in enumerate(probabilities[0][:7])  # Up to 7 rounds
                }
            }
            
            # SHAP explanation
            if 'shap_round' in self.explainers:
                shap_values = self.explainers['shap_round'].shap_values(feature_vector)
                
                if isinstance(shap_values, list):
                    # Multi-class case
                    shap_values_for_predicted = shap_values[predicted_round - 1]
                else:
                    shap_values_for_predicted = shap_values
                
                explanation['shap_values'] = shap_values_for_predicted[0].tolist()
                explanation['base_value'] = float(self.explainers['shap_round'].expected_value)
                
                # Feature contributions for predicted round
                feature_importance = [(self.feature_names[i], shap_values_for_predicted[0][i]) 
                                    for i in range(len(self.feature_names))]
                feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
                
                explanation['feature_contributions'] = [
                    {'feature': feat, 'contribution': float(contrib),
                     'impact': f'favors_round_{predicted_round}' if contrib > 0 else f'opposes_round_{predicted_round}'}
                    for feat, contrib in feature_importance[:10]
                ]
            
            return explanation
            
        except Exception as e:
            return {'error': f'Round explanation error: {e}'}
    
    def _get_global_feature_importance(self) -> Dict[str, Any]:
        """Get global feature importance across all models"""
        importance = {
            'rank_model_importance': {},
            'admission_model_importance': {},
            'round_model_importance': {}
        }
        
        try:
            # Rank model importance
            if hasattr(self.models['rank_prediction'], 'feature_importance'):
                rank_importance = self.models['rank_prediction'].feature_importance()
                importance['rank_model_importance'] = {
                    feat: float(imp) for feat, imp in zip(self.feature_names, rank_importance)
                }
            
            # Admission model importance (if tree-based)
            if hasattr(self.models['admission_probability'], 'feature_importances_'):
                admission_importance = self.models['admission_probability'].feature_importances_
                importance['admission_model_importance'] = {
                    feat: float(imp) for feat, imp in zip(self.feature_names, admission_importance)
                }
            
            # Round model importance
            if hasattr(self.models['round_prediction'], 'feature_importance'):
                round_importance = self.models['round_prediction'].feature_importance()
                importance['round_model_importance'] = {
                    feat: float(imp) for feat, imp in zip(self.feature_names, round_importance)
                }
                
        except Exception as e:
            importance['error'] = str(e)
        
        return importance
    
    def _generate_counterfactuals(self, feature_vector: np.ndarray, 
                                 original_features: Dict[str, Any]) -> Dict[str, Any]:
        """Generate counterfactual explanations"""
        counterfactuals = {
            'scenarios': [],
            'sensitivity_analysis': {}
        }
        
        try:
            # Get original predictions
            original_rank = self.models['rank_prediction'].predict(feature_vector)[0]
            original_prob = self.models['admission_probability'].predict_proba(feature_vector)[0][1]
            
            # Test key feature variations
            key_features = ['applicant_rank', 'Annual_Fees', 'Bond_Years']
            
            for feature_idx, feature_name in enumerate(self.feature_names):
                if feature_name in key_features:
                    # Test +/- 20% variations
                    for variation in [-0.2, -0.1, 0.1, 0.2]:
                        modified_vector = feature_vector.copy()
                        original_value = modified_vector[0][feature_idx]
                        modified_vector[0][feature_idx] = original_value * (1 + variation)
                        
                        # Get new predictions
                        new_rank = self.models['rank_prediction'].predict(modified_vector)[0]
                        new_prob = self.models['admission_probability'].predict_proba(modified_vector)[0][1]
                        
                        # Calculate changes
                        rank_change = new_rank - original_rank
                        prob_change = new_prob - original_prob
                        
                        counterfactuals['scenarios'].append({
                            'feature_changed': feature_name,
                            'original_value': float(original_value),
                            'new_value': float(modified_vector[0][feature_idx]),
                            'change_percent': variation * 100,
                            'rank_impact': float(rank_change),
                            'probability_impact': float(prob_change),
                            'interpretation': self._interpret_counterfactual(
                                feature_name, variation, rank_change, prob_change
                            )
                        })
            
            # Sensitivity analysis
            counterfactuals['sensitivity_analysis'] = self._perform_sensitivity_analysis(
                feature_vector, original_rank, original_prob
            )
            
        except Exception as e:
            counterfactuals['error'] = str(e)
        
        return counterfactuals
    
    def _interpret_counterfactual(self, feature: str, variation: float, 
                                 rank_change: float, prob_change: float) -> str:
        """Generate human-readable interpretation of counterfactual"""
        direction = "increase" if variation > 0 else "decrease"
        magnitude = "significantly" if abs(variation) >= 0.2 else "slightly"
        
        rank_impact = "improve" if rank_change < 0 else "worsen"
        prob_impact = "increase" if prob_change > 0 else "decrease"
        
        return (f"If you {magnitude} {direction} {feature}, "
               f"your predicted rank would {rank_impact} by {abs(rank_change):.0f} "
               f"and admission probability would {prob_impact} by {abs(prob_change):.1%}")
    
    def _perform_sensitivity_analysis(self, feature_vector: np.ndarray, 
                                     original_rank: float, original_prob: float) -> Dict[str, Any]:
        """Perform sensitivity analysis for key features"""
        sensitivity = {}
        
        # Test sensitivity to applicant rank changes
        if 'applicant_rank' in [f.lower() for f in self.feature_names]:
            rank_variations = range(-10000, 11000, 2000)  # Test rank changes
            rank_impacts = []
            
            for variation in rank_variations:
                modified_vector = feature_vector.copy()
                # Find applicant_rank feature index
                for i, feat in enumerate(self.feature_names):
                    if 'applicant_rank' in feat.lower():
                        modified_vector[0][i] += variation
                        break
                
                try:
                    new_prob = self.models['admission_probability'].predict_proba(modified_vector)[0][1]
                    rank_impacts.append({
                        'rank_change': variation,
                        'probability': float(new_prob),
                        'probability_change': float(new_prob - original_prob)
                    })
                except:
                    continue
            
            sensitivity['applicant_rank_sensitivity'] = rank_impacts
        
        return sensitivity
    
    def generate_explanation_plots(self, explanation: Dict[str, Any]) -> Dict[str, str]:
        """Generate visualization plots for explanations"""
        plots = {}
        
        try:
            # Feature importance plot
            if 'rank_explanation' in explanation and 'feature_contributions' in explanation['rank_explanation']:
                plots['feature_importance'] = self._create_feature_importance_plot(
                    explanation['rank_explanation']['feature_contributions']
                )
            
            # Waterfall plot for SHAP values
            if 'admission_explanation' in explanation and 'shap_values' in explanation['admission_explanation']:
                plots['waterfall'] = self._create_waterfall_plot(
                    explanation['admission_explanation']
                )
            
            # Counterfactual scenarios plot
            if 'counterfactuals' in explanation and 'scenarios' in explanation['counterfactuals']:
                plots['counterfactuals'] = self._create_counterfactual_plot(
                    explanation['counterfactuals']['scenarios']
                )
                
        except Exception as e:
            plots['error'] = str(e)
        
        return plots
    
    def _create_feature_importance_plot(self, contributions: List[Dict]) -> str:
        """Create feature importance plot"""
        features = [c['feature'] for c in contributions]
        values = [c['contribution'] for c in contributions]
        colors = ['green' if v > 0 else 'red' for v in values]
        
        fig = go.Figure(data=[
            go.Bar(x=values, y=features, orientation='h', 
                   marker_color=colors, text=[f"{v:.0f}" for v in values])
        ])
        
        fig.update_layout(
            title="Feature Contributions to Prediction",
            xaxis_title="Contribution",
            yaxis_title="Features",
            height=400
        )
        
        return fig.to_json()
    
    def _create_waterfall_plot(self, admission_explanation: Dict) -> str:
        """Create waterfall plot for SHAP values"""
        if 'feature_contributions' not in admission_explanation:
            return "{}"
        
        contributions = admission_explanation['feature_contributions'][:8]  # Top 8
        
        features = [c['feature'] for c in contributions]
        values = [c['contribution'] for c in contributions]
        
        # Create cumulative values for waterfall
        cumulative = [admission_explanation.get('base_value', 0)]
        for v in values:
            cumulative.append(cumulative[-1] + v)
        
        fig = go.Figure(go.Waterfall(
            name="Feature Contributions",
            orientation="v",
            measure=["relative"] * len(features) + ["total"],
            x=features + ["Final Prediction"],
            y=values + [cumulative[-1]],
            connector={"line": {"color": "rgb(63, 63, 63)"}},
        ))
        
        fig.update_layout(
            title="Waterfall Plot - How Features Affect Admission Probability",
            height=400
        )
        
        return fig.to_json()
    
    def _create_counterfactual_plot(self, scenarios: List[Dict]) -> str:
        """Create counterfactual scenarios plot"""
        # Group by feature for better visualization
        feature_groups = {}
        for scenario in scenarios:
            feature = scenario['feature_changed']
            if feature not in feature_groups:
                feature_groups[feature] = []
            feature_groups[feature].append(scenario)
        
        fig = make_subplots(rows=len(feature_groups), cols=1,
                           subplot_titles=list(feature_groups.keys()))
        
        for i, (feature, scenarios_list) in enumerate(feature_groups.items(), 1):
            changes = [s['change_percent'] for s in scenarios_list]
            prob_impacts = [s['probability_impact'] for s in scenarios_list]
            
            fig.add_trace(
                go.Scatter(x=changes, y=prob_impacts, mode='lines+markers',
                          name=f'{feature} Impact'),
                row=i, col=1
            )
        
        fig.update_layout(
            title="Counterfactual Analysis - Feature Impact on Admission Probability",
            height=200 * len(feature_groups)
        )
        
        return fig.to_json()

# Example usage and testing
if __name__ == "__main__":
    # Initialize explainability engine
    explainer = ExplainabilityEngine()
    
    # Test explanation for a candidate
    test_candidate = {
        'air': 25000,
        'annual_fees': 50000,
        'stipend_year1': 60000,
        'bond_years': 2,
        'bond_amount': 4000000,
        'total_beds': 500
    }
    
    # Generate explanations
    explanations = explainer.explain_prediction(test_candidate)
    
    # Print results
    print(json.dumps(explanations, indent=2))