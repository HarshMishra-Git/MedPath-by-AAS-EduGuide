#!/usr/bin/env python3
"""
Enhanced Prediction System
Round-specific predictions, confidence intervals, future projections, detailed trend analysis
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import joblib
import warnings
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
warnings.filterwarnings('ignore')

class EnhancedPredictionSystem:
    """Enhanced prediction system with comprehensive college and round predictions"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.college_mappings = {}
        self.features = []
        self.round_models = {}
        
    def load_models(self):
        """Load all trained models"""
        try:
            # Load advanced models if available
            self.models['xgboost'] = joblib.load('xgboost_reg_model.pkl')
            self.models['catboost'] = joblib.load('catboost_reg_model.pkl')
            self.models['ensemble'] = joblib.load('ensemble_reg_model.pkl')
            self.models['quantile'] = joblib.load('quantile_models.pkl')
            
            # Load encoders and scalers
            self.encoders = joblib.load('advanced_encoders.pkl')
            self.scalers = joblib.load('advanced_scalers.pkl')
            
            print("✅ Advanced models loaded successfully")
        except FileNotFoundError:
            print("⚠️  Advanced models not found. Loading basic models...")
            try:
                self.models['rank_prediction'] = joblib.load('rank_prediction_model.pkl')
                self.models['admission_probability'] = joblib.load('admission_probability_model.pkl')
                self.models['round_prediction'] = joblib.load('round_prediction_model.pkl')
                self.scalers['standard'] = joblib.load('rank_prediction_scaler.pkl')
                self.encoders = joblib.load('label_encoders.pkl')
                print("✅ Basic models loaded successfully")
            except FileNotFoundError:
                print("❌ No models found. Please train models first.")
                return False
        return True
    
    def prepare_data_for_prediction(self):
        """Prepare comprehensive dataset for predictions"""
        print("=== PREPARING DATA FOR ENHANCED PREDICTIONS ===")
        
        # Load all data
        try:
            features_df = pd.read_csv('neet_pg_features_normalized.csv')
            ranks_df = pd.read_csv('closing_ranks_long.csv')
        except FileNotFoundError:
            print("❌ Required data files not found")
            return None
        
        # Create comprehensive mapping
        self.create_college_mappings(features_df, ranks_df)
        
        # Merge data
        full_df = features_df.merge(
            ranks_df, 
            on=['Institute', 'Course', 'State', 'Category', 'Quota'],
            how='left'
        )
        
        print(f"Comprehensive dataset shape: {full_df.shape}")
        return full_df
    
    def create_college_mappings(self, features_df, ranks_df):
        """Create comprehensive college mappings for predictions"""
        print("Creating college mappings...")
        
        # Institute-Course-Category-Quota combinations
        combinations = features_df[['Institute', 'Course', 'State', 'Category', 'Quota']].drop_duplicates()
        
        # Add historical rank data
        rank_stats = ranks_df.groupby(['Institute', 'Course', 'State', 'Category', 'Quota']).agg({
            'closing_rank': ['mean', 'median', 'min', 'max', 'std', 'count'],
            'year': ['min', 'max'],
            'round': ['min', 'max', 'nunique']
        }).reset_index()
        
        # Flatten columns
        rank_stats.columns = ['_'.join(col) if col[1] else col[0] for col in rank_stats.columns]
        
        # Merge with features
        self.college_mappings = combinations.merge(
            features_df[['Institute', 'Course', 'State', 'Category', 'Quota', 
                        'Annual_Fees', 'Stipend_Year1', 'Bond_Years', 'Bond_Amount', 'Total_Beds']],
            on=['Institute', 'Course', 'State', 'Category', 'Quota'],
            how='left'
        ).merge(
            rank_stats,
            left_on=['Institute', 'Course', 'State', 'Category', 'Quota'],
            right_on=['Institute_', 'Course_', 'State_', 'Category_', 'Quota_'],
            how='left'
        )
        
        print(f"Created mappings for {len(self.college_mappings)} combinations")
    
    def predict_college_admission_probability(self, user_inputs: Dict) -> List[Dict]:
        """
        Predict admission probability for each college combination
        
        Args:
            user_inputs: Dict with Category, State, Course, Type of Course, Quota, AIR
        
        Returns:
            List of college predictions with probabilities
        """
        print("=== PREDICTING COLLEGE ADMISSION PROBABILITIES ===")
        
        # Filter relevant colleges based on user inputs
        relevant_colleges = self.college_mappings[
            (self.college_mappings['Category'] == user_inputs['Category']) &
            (self.college_mappings['State'] == user_inputs['State']) &
            (self.college_mappings['Course'] == user_inputs['Course']) &
            (self.college_mappings['Quota'] == user_inputs['Quota'])
        ].copy()
        
        if relevant_colleges.empty:
            print("❌ No matching colleges found for the given criteria")
            return []
        
        print(f"Found {len(relevant_colleges)} relevant colleges")
        
        predictions = []
        user_rank = user_inputs['AIR']
        
        for _, college in relevant_colleges.iterrows():
            # Calculate admission probability
            if pd.notna(college.get('closing_rank_mean')):
                # Historical data available
                mean_closing_rank = college['closing_rank_mean']
                std_closing_rank = college.get('closing_rank_std', mean_closing_rank * 0.1)
                
                # Probability calculation using normal distribution
                if std_closing_rank > 0:
                    z_score = (user_rank - mean_closing_rank) / std_closing_rank
                    probability = 1 / (1 + np.exp(z_score))  # Sigmoid function
                else:
                    probability = 1.0 if user_rank <= mean_closing_rank else 0.0
            else:
                # No historical data - use heuristic
                probability = 0.5
            
            # Round-specific predictions
            round_predictions = self.predict_admission_rounds(college, user_rank)
            
            # Confidence intervals using quantile models if available
            confidence_intervals = self.calculate_confidence_intervals(college, user_rank)
            
            # Create prediction object
            prediction = {
                'institute': college['Institute'],
                'course': college['Course'],
                'state': college['State'],
                'category': college['Category'],
                'quota': college['Quota'],
                'admission_probability': round(probability, 3),
                'confidence_score': self.calculate_confidence_score(college, probability),
                'predicted_closing_rank': mean_closing_rank if pd.notna(college.get('closing_rank_mean')) else None,
                'round_predictions': round_predictions,
                'confidence_intervals': confidence_intervals,
                'college_details': {
                    'annual_fees': self.format_financial_value(college.get('Annual_Fees')),
                    'stipend_year1': self.format_financial_value(college.get('Stipend_Year1')),
                    'bond_years': self.format_numeric_value(college.get('Bond_Years')),
                    'bond_amount': self.format_financial_value(college.get('Bond_Amount')),
                    'total_beds': self.format_numeric_value(college.get('Total_Beds'))
                },
                'historical_trends': self.get_historical_trends(college),
                'recommendation_score': self.calculate_recommendation_score(college, probability, user_inputs)
            }
            
            predictions.append(prediction)
        
        # Sort by recommendation score
        predictions = sorted(predictions, key=lambda x: x['recommendation_score'], reverse=True)
        
        print(f"Generated predictions for {len(predictions)} colleges")
        return predictions
    
    def predict_admission_rounds(self, college: pd.Series, user_rank: int) -> Dict:
        """Predict most likely admission round for each college"""
        rounds_data = {}
        
        # Get historical round data if available
        for round_num in range(1, 8):  # Rounds 1-7
            round_col = f'closing_rank_round_{round_num}'
            if round_col in college.index and pd.notna(college[round_col]):
                closing_rank = college[round_col]
                probability = 1.0 if user_rank <= closing_rank else 0.0
                rounds_data[f'round_{round_num}'] = {
                    'probability': probability,
                    'closing_rank': closing_rank,
                    'rank_margin': closing_rank - user_rank if closing_rank else None
                }
        
        # If no specific round data, estimate based on overall trends
        if not rounds_data and pd.notna(college.get('closing_rank_mean')):
            base_rank = college['closing_rank_mean']
            # Typically, closing ranks decrease (become more competitive) in later rounds
            for round_num in range(1, 6):
                estimated_closing_rank = base_rank * (0.95 ** (round_num - 1))
                probability = 1.0 if user_rank <= estimated_closing_rank else 0.0
                rounds_data[f'round_{round_num}'] = {
                    'probability': probability,
                    'closing_rank': estimated_closing_rank,
                    'rank_margin': estimated_closing_rank - user_rank
                }
        
        # Find most likely round
        most_likely_round = None
        highest_prob = 0
        
        for round_name, data in rounds_data.items():
            if data['probability'] > highest_prob:
                highest_prob = data['probability']
                most_likely_round = round_name
        
        return {
            'most_likely_round': most_likely_round,
            'round_probabilities': rounds_data
        }
    
    def calculate_confidence_intervals(self, college: pd.Series, user_rank: int) -> Dict:
        """Calculate confidence intervals using quantile regression if available"""
        if 'quantile' not in self.models:
            return {'lower_bound': None, 'upper_bound': None, 'confidence_level': 0.8}
        
        try:
            # Prepare features for quantile prediction
            features = self.prepare_college_features(college)
            quantile_models = self.models['quantile']
            
            if isinstance(quantile_models, dict):
                lower_pred = quantile_models[0.1].predict([features])[0]
                upper_pred = quantile_models[0.9].predict([features])[0]
                
                return {
                    'lower_bound': round(lower_pred, 0),
                    'upper_bound': round(upper_pred, 0),
                    'confidence_level': 0.8,
                    'prediction_range': round(upper_pred - lower_pred, 0)
                }
        except Exception as e:
            print(f"Error calculating confidence intervals: {e}")
        
        return {'lower_bound': None, 'upper_bound': None, 'confidence_level': 0.8}
    
    def calculate_confidence_score(self, college: pd.Series, probability: float) -> float:
        """Calculate confidence score for the prediction"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence if we have historical data
        if pd.notna(college.get('closing_rank_count')) and college.get('closing_rank_count', 0) > 5:
            confidence += 0.3
        
        # Increase confidence if standard deviation is low (consistent results)
        if pd.notna(college.get('closing_rank_std')):
            cv = college['closing_rank_std'] / college.get('closing_rank_mean', 1)  # Coefficient of variation
            if cv < 0.2:  # Low variability
                confidence += 0.2
        
        # Adjust based on probability extremes
        if probability > 0.8 or probability < 0.2:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def get_historical_trends(self, college: pd.Series) -> Dict:
        """Get historical trend data for the college"""
        trends = {
            'year_over_year_change': None,
            'trend_direction': 'stable',
            'volatility': 'low'
        }
        
        # If we have year range data
        if pd.notna(college.get('year_min')) and pd.notna(college.get('year_max')):
            year_span = college['year_max'] - college['year_min']
            trends['data_years'] = year_span + 1
        
        # Calculate volatility based on standard deviation
        if pd.notna(college.get('closing_rank_std')) and pd.notna(college.get('closing_rank_mean')):
            cv = college['closing_rank_std'] / college['closing_rank_mean']
            if cv > 0.3:
                trends['volatility'] = 'high'
            elif cv > 0.15:
                trends['volatility'] = 'medium'
            else:
                trends['volatility'] = 'low'
        
        return trends
    
    def calculate_recommendation_score(self, college: pd.Series, probability: float, user_inputs: Dict) -> float:
        """Calculate overall recommendation score considering multiple factors"""
        score = probability * 0.4  # Base score from admission probability
        
        # Factor in fees (lower is better)
        if pd.notna(college.get('Annual_Fees')):
            fee_score = max(0, 1 - (college['Annual_Fees'] / 500000))  # Normalize to 500k max
            score += fee_score * 0.15
        
        # Factor in stipend (higher is better)
        if pd.notna(college.get('Stipend_Year1')):
            stipend_score = min(1, college['Stipend_Year1'] / 100000)  # Normalize to 100k max
            score += stipend_score * 0.1
        
        # Factor in bond (lower is better)
        if pd.notna(college.get('Bond_Amount')):
            bond_score = max(0, 1 - (college['Bond_Amount'] / 5000000))  # Normalize to 50L max
            score += bond_score * 0.1
        else:
            score += 0.1  # Bonus for no bond
        
        # Factor in bed availability (higher is better for training)
        if pd.notna(college.get('Total_Beds')):
            bed_score = min(1, college['Total_Beds'] / 2000)  # Normalize to 2000 max
            score += bed_score * 0.1
        
        # Factor in data reliability
        if pd.notna(college.get('closing_rank_count')) and college.get('closing_rank_count', 0) > 10:
            score += 0.15  # Bonus for reliable historical data
        
        return min(score, 1.0)
    
    def predict_future_trends(self, college_data: Dict, years_ahead: int = 1) -> Dict:
        """Predict future closing rank trends"""
        print(f"=== PREDICTING FUTURE TRENDS ({years_ahead} YEARS AHEAD) ===")
        
        # Simple trend analysis based on historical data
        future_predictions = {}
        
        if 'historical_trends' in college_data:
            current_rank = college_data.get('predicted_closing_rank')
            
            if current_rank:
                # Simple linear projection (can be enhanced with time series models)
                volatility = college_data['historical_trends'].get('volatility', 'medium')
                
                # Predict based on general medical education trends
                # Typically, competition increases over time
                trend_factor = 0.95  # Ranks become more competitive (lower numbers)
                
                if volatility == 'high':
                    uncertainty = 0.2
                elif volatility == 'low':
                    uncertainty = 0.05
                else:
                    uncertainty = 0.1
                
                predicted_rank = current_rank * (trend_factor ** years_ahead)
                margin_of_error = predicted_rank * uncertainty
                
                future_predictions = {
                    'predicted_closing_rank': round(predicted_rank, 0),
                    'confidence_range': [
                        round(predicted_rank - margin_of_error, 0),
                        round(predicted_rank + margin_of_error, 0)
                    ],
                    'trend_assumption': 'Increasing competition',
                    'years_projected': years_ahead
                }
        
        return future_predictions
    
    def generate_comparative_analysis(self, predictions: List[Dict]) -> Dict:
        """Generate comparative analysis across all predicted colleges"""
        print("=== GENERATING COMPARATIVE ANALYSIS ===")
        
        if not predictions:
            return {}
        
        # Extract metrics for analysis
        probabilities = [p['admission_probability'] for p in predictions if p['admission_probability'] is not None]
        fees = [p['college_details']['annual_fees'] for p in predictions if p['college_details']['annual_fees'] != 'Unavailable']
        stipends = [p['college_details']['stipend_year1'] for p in predictions if p['college_details']['stipend_year1'] != 'Unavailable']
        
        # Convert string values to numbers for analysis
        fees_numeric = []
        stipends_numeric = []
        
        for fee in fees:
            try:
                if fee != 'Unavailable':
                    fees_numeric.append(float(fee.replace('₹', '').replace(',', '')))
            except:
                continue
        
        for stipend in stipends:
            try:
                if stipend != 'Unavailable':
                    stipends_numeric.append(float(stipend.replace('₹', '').replace(',', '')))
            except:
                continue
        
        analysis = {
            'total_colleges': len(predictions),
            'high_probability_colleges': len([p for p in predictions if p['admission_probability'] > 0.7]),
            'medium_probability_colleges': len([p for p in predictions if 0.3 <= p['admission_probability'] <= 0.7]),
            'low_probability_colleges': len([p for p in predictions if p['admission_probability'] < 0.3]),
            'probability_statistics': {
                'mean': round(np.mean(probabilities), 3) if probabilities else 0,
                'median': round(np.median(probabilities), 3) if probabilities else 0,
                'max': round(max(probabilities), 3) if probabilities else 0,
                'min': round(min(probabilities), 3) if probabilities else 0
            },
            'fees_analysis': {
                'average': round(np.mean(fees_numeric), 0) if fees_numeric else 0,
                'min': round(min(fees_numeric), 0) if fees_numeric else 0,
                'max': round(max(fees_numeric), 0) if fees_numeric else 0,
                'count_with_data': len(fees_numeric)
            },
            'stipend_analysis': {
                'average': round(np.mean(stipends_numeric), 0) if stipends_numeric else 0,
                'min': round(min(stipends_numeric), 0) if stipends_numeric else 0,
                'max': round(max(stipends_numeric), 0) if stipends_numeric else 0,
                'count_with_data': len(stipends_numeric)
            },
            'recommendations': self.generate_recommendations(predictions)
        }
        
        return analysis
    
    def generate_recommendations(self, predictions: List[Dict]) -> List[str]:
        """Generate personalized recommendations based on predictions"""
        recommendations = []
        
        if not predictions:
            return ["No colleges found matching your criteria. Please try different parameters."]
        
        # Top colleges recommendation
        top_colleges = [p for p in predictions[:3] if p['admission_probability'] > 0.5]
        if top_colleges:
            recommendations.append(f"Focus on top {len(top_colleges)} colleges with admission probability > 50%")
        
        # Safety options
        safety_colleges = [p for p in predictions if p['admission_probability'] > 0.8]
        if safety_colleges:
            recommendations.append(f"You have {len(safety_colleges)} safety options with high admission chances")
        
        # Financial recommendations
        affordable_colleges = [p for p in predictions 
                             if p['college_details']['annual_fees'] != 'Unavailable' 
                             and float(p['college_details']['annual_fees'].replace('₹', '').replace(',', '')) < 100000]
        if affordable_colleges:
            recommendations.append(f"Consider {len(affordable_colleges)} affordable options with fees < ₹1 Lakh")
        
        # Round strategy
        early_round_colleges = []
        for p in predictions:
            if p['round_predictions']['most_likely_round'] in ['round_1', 'round_2']:
                early_round_colleges.append(p)
        
        if early_round_colleges:
            recommendations.append(f"Prioritize {len(early_round_colleges)} colleges likely to fill in early rounds")
        
        return recommendations
    
    def format_financial_value(self, value) -> str:
        """Format financial values with proper currency formatting"""
        if pd.isna(value) or value == 'Info not available' or value == '-':
            return "Unavailable"
        
        try:
            if isinstance(value, str):
                # Remove existing formatting
                clean_value = value.replace('₹', '').replace(',', '').strip()
                numeric_value = float(clean_value)
            else:
                numeric_value = float(value)
            
            return f"₹{numeric_value:,.0f}"
        except:
            return "Unavailable"
    
    def format_numeric_value(self, value) -> str:
        """Format numeric values"""
        if pd.isna(value) or value == 'Info not available' or value == '-':
            return "Unavailable"
        
        try:
            return str(int(float(value)))
        except:
            return "Unavailable"
    
    def prepare_college_features(self, college: pd.Series) -> List[float]:
        """Prepare feature vector for a college (for quantile prediction)"""
        # This is a simplified version - in practice, you'd use the same features
        # as used during training
        features = [
            college.get('Annual_Fees', 0),
            college.get('Stipend_Year1', 0),
            college.get('Bond_Years', 0),
            college.get('Bond_Amount', 0),
            college.get('Total_Beds', 0),
            college.get('closing_rank_mean', 50000),
            college.get('closing_rank_std', 10000),
            2024,  # Current year
            1  # Default round
        ]
        
        # Handle missing values
        features = [f if pd.notna(f) and f != 'Info not available' else 0 for f in features]
        return features
    
    def save_predictions(self, predictions: List[Dict], user_inputs: Dict, filename: str = None):
        """Save predictions to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"predictions_{timestamp}.json"
        
        output_data = {
            'timestamp': datetime.now().isoformat(),
            'user_inputs': user_inputs,
            'predictions': predictions,
            'summary': self.generate_comparative_analysis(predictions)
        }
        
        with open(filename, 'w') as f:
            json.dump(output_data, f, indent=2, default=str)
        
        print(f"Predictions saved to {filename}")
    
    def run_complete_prediction(self, user_inputs: Dict) -> Dict:
        """Run complete prediction pipeline"""
        print("=== RUNNING COMPLETE PREDICTION PIPELINE ===")
        print(f"User inputs: {user_inputs}")
        
        # Load models
        if not self.load_models():
            return {'error': 'Failed to load models'}
        
        # Prepare data
        if self.prepare_data_for_prediction() is None:
            return {'error': 'Failed to prepare data'}
        
        # Generate predictions
        predictions = self.predict_college_admission_probability(user_inputs)
        
        if not predictions:
            return {'error': 'No matching colleges found'}
        
        # Generate comparative analysis
        analysis = self.generate_comparative_analysis(predictions)
        
        # Add future trends for top colleges
        for i, prediction in enumerate(predictions[:5]):  # Top 5 colleges
            future_trends = self.predict_future_trends(prediction, years_ahead=1)
            predictions[i]['future_trends'] = future_trends
        
        # Compile complete results
        results = {
            'user_query': user_inputs,
            'total_colleges_found': len(predictions),
            'predictions': predictions,
            'comparative_analysis': analysis,
            'generation_timestamp': datetime.now().isoformat()
        }
        
        # Save results
        self.save_predictions(predictions, user_inputs)
        
        print(f"✅ Complete prediction pipeline finished. Found {len(predictions)} colleges.")
        return results

def main():
    """Main function to demonstrate the enhanced prediction system"""
    
    # Example usage
    prediction_system = EnhancedPredictionSystem()
    
    # Sample user inputs
    sample_user_inputs = {
        'Category': 'OPEN-GEN',
        'State': 'Andhra Pradesh',
        'Course': 'ANAESTHESIOLOGY',
        'Type_of_Course': 'CLINICAL',
        'Quota': 'AP Govt-NS LOC',
        'AIR': 25000
    }
    
    print("=== ENHANCED PREDICTION SYSTEM DEMO ===")
    print(f"Sample query: {sample_user_inputs}")
    
    # Run predictions
    results = prediction_system.run_complete_prediction(sample_user_inputs)
    
    if 'error' not in results:
        print(f"\n✅ Successfully generated predictions for {results['total_colleges_found']} colleges")
        
        # Display top 3 results
        print("\n🏆 TOP 3 COLLEGE RECOMMENDATIONS:")
        for i, pred in enumerate(results['predictions'][:3], 1):
            print(f"\n{i}. {pred['institute']}")
            print(f"   Course: {pred['course']}")
            print(f"   Admission Probability: {pred['admission_probability']:.1%}")
            print(f"   Recommendation Score: {pred['recommendation_score']:.3f}")
            print(f"   Most Likely Round: {pred['round_predictions']['most_likely_round']}")
            print(f"   Annual Fees: {pred['college_details']['annual_fees']}")
            print(f"   Stipend: {pred['college_details']['stipend_year1']}")
    else:
        print(f"❌ Error: {results['error']}")
    
    return prediction_system

if __name__ == "__main__":
    system = main()