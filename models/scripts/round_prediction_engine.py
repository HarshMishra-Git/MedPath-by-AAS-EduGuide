#!/usr/bin/env python3
"""
NEET-PG Advanced Round Prediction Engine
========================================
Comprehensive round-wise prediction with probabilities, confidence intervals, and optimal counseling strategies
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.isotonic import IsotonicRegression
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

from typing import Dict, List, Any, Tuple, Optional
import json

class AdvancedRoundPredictionEngine:
    """Advanced round prediction with confidence intervals and strategy optimization"""
    
    def __init__(self, models_dir: str = "."):
        """Initialize the advanced round prediction engine"""
        self.models_dir = models_dir
        self.models = {}
        self.calibrators = {}
        self.confidence_models = {}
        self.historical_data = None
        self.feature_names = None
        self.load_models_and_data()
        self._initialize_advanced_models()
    
    def load_models_and_data(self):
        """Load existing models and historical data"""
        try:
            # Load existing models
            self.models['rank_prediction'] = joblib.load(f'{self.models_dir}/rank_prediction_model.pkl')
            self.models['admission_probability'] = joblib.load(f'{self.models_dir}/admission_probability_model.pkl')
            self.models['round_prediction'] = joblib.load(f'{self.models_dir}/round_prediction_model.pkl')
            
            # Load historical closing ranks data
            self.historical_data = pd.read_csv(f'{self.models_dir}/closing_ranks_long.csv')
            
            # Load sample data for feature names
            sample_data = pd.read_csv(f'{self.models_dir}/sample_api_data.csv')
            self.feature_names = [col for col in sample_data.columns 
                                if col not in ['Institute', 'Course', 'Category', 'Quota', 'closing_rank']]
            
            print("✅ Models and data loaded successfully")
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise
    
    def _initialize_advanced_models(self):
        """Initialize advanced models for confidence intervals and calibration"""
        try:
            print("Initializing advanced prediction models...")
            
            # Initialize quantile regression models for confidence intervals
            self._initialize_quantile_models()
            
            # Initialize probability calibration models
            self._initialize_calibration_models()
            
            # Build round-wise probability models
            self._build_round_wise_models()
            
            print("✅ Advanced models initialized")
            
        except Exception as e:
            print(f"❌ Error initializing advanced models: {e}")
    
    def _initialize_quantile_models(self):
        """Initialize quantile regression models for confidence intervals"""
        self.confidence_models['quantile_regressors'] = {
            'lower': GradientBoostingRegressor(
                loss='quantile', alpha=0.1, n_estimators=100, random_state=42
            ),
            'median': GradientBoostingRegressor(
                loss='quantile', alpha=0.5, n_estimators=100, random_state=42
            ),
            'upper': GradientBoostingRegressor(
                loss='quantile', alpha=0.9, n_estimators=100, random_state=42
            )
        }
    
    def _initialize_calibration_models(self):
        """Initialize probability calibration models"""
        self.calibrators['round_probabilities'] = {}
        for round_num in range(1, 8):  # Rounds 1-7
            self.calibrators['round_probabilities'][round_num] = IsotonicRegression(
                out_of_bounds='clip'
            )
    
    def _build_round_wise_models(self):
        """Build specialized models for each round prediction"""
        self.models['round_wise'] = {}
        
        # Create models for each round
        for round_num in range(1, 8):
            self.models['round_wise'][round_num] = {
                'probability_model': RandomForestRegressor(
                    n_estimators=100, random_state=42
                ),
                'features': [],
                'trained': False
            }
    
    def predict_round_probabilities(self, candidate_features: Dict[str, Any], 
                                  institute_course_combo: Dict[str, str]) -> Dict[str, Any]:
        """Predict probabilities for each counseling round with confidence intervals"""
        try:
            # Prepare feature vector
            feature_vector = self._prepare_features(candidate_features)
            
            # Get base predictions
            predicted_rank = self.models['rank_prediction'].predict(feature_vector)[0]
            admission_prob = self.models['admission_probability'].predict_proba(feature_vector)[0][1]
            
            # Get round-wise analysis from historical data
            round_analysis = self._analyze_historical_rounds(
                institute_course_combo, candidate_features.get('air', 50000)
            )
            
            # Calculate round-wise probabilities
            round_probabilities = self._calculate_round_probabilities(
                predicted_rank, institute_course_combo, round_analysis
            )
            
            # Add confidence intervals
            confidence_intervals = self._calculate_confidence_intervals(
                feature_vector, round_probabilities
            )
            
            # Generate strategy recommendations
            strategy = self._generate_counseling_strategy(
                round_probabilities, confidence_intervals, candidate_features
            )
            
            return {
                'candidate_air': candidate_features.get('air'),
                'predicted_closing_rank': float(predicted_rank),
                'overall_admission_probability': float(admission_prob),
                'round_wise_predictions': round_probabilities,
                'confidence_intervals': confidence_intervals,
                'historical_analysis': round_analysis,
                'counseling_strategy': strategy,
                'recommendations': self._generate_recommendations(
                    round_probabilities, strategy, candidate_features
                )
            }
            
        except Exception as e:
            return {'error': f'Round prediction error: {e}'}
    
    def _prepare_features(self, candidate_features: Dict[str, Any]) -> np.ndarray:
        """Convert candidate features to model input format"""
        feature_vector = np.zeros(len(self.feature_names))
        
        # Map known features to vector positions
        feature_mapping = {
            'Annual_Fees': candidate_features.get('annual_fees', 0),
            'Stipend_Year1': candidate_features.get('stipend_year1', 0),
            'Bond_Years': candidate_features.get('bond_years', 0),
            'Bond_Amount': candidate_features.get('bond_amount', 0),
            'Total_Beds': candidate_features.get('total_beds', 0),
            'applicant_rank': candidate_features.get('air', 50000),
            'year': 2024,
            'round': 1  # Will vary for round-specific predictions
        }
        
        for i, feature_name in enumerate(self.feature_names):
            if feature_name in feature_mapping:
                feature_vector[i] = feature_mapping[feature_name]
        
        return feature_vector.reshape(1, -1)
    
    def _analyze_historical_rounds(self, institute_course_combo: Dict[str, str], 
                                 candidate_air: int) -> Dict[str, Any]:
        """Analyze historical round-wise closing ranks for the specific combination"""
        try:
            # Filter historical data for the specific combination
            filtered_data = self.historical_data[
                (self.historical_data['Institute'].str.upper() == institute_course_combo.get('institute', '').upper()) &
                (self.historical_data['Course'].str.upper() == institute_course_combo.get('course', '').upper()) &
                (self.historical_data['Category'].str.upper() == institute_course_combo.get('category', '').upper()) &
                (self.historical_data['Quota'].str.upper() == institute_course_combo.get('quota', '').upper())
            ]
            
            if filtered_data.empty:
                return {'error': 'No historical data found for this combination'}
            
            # Analyze round-wise patterns
            round_analysis = {}
            
            for round_num in sorted(filtered_data['round'].unique()):
                round_data = filtered_data[filtered_data['round'] == round_num]
                
                if not round_data.empty:
                    closing_ranks = round_data['closing_rank'].values
                    
                    round_analysis[f'round_{round_num}'] = {
                        'historical_closing_ranks': closing_ranks.tolist(),
                        'mean_closing_rank': float(np.mean(closing_ranks)),
                        'median_closing_rank': float(np.median(closing_ranks)),
                        'std_closing_rank': float(np.std(closing_ranks)),
                        'min_closing_rank': float(np.min(closing_ranks)),
                        'max_closing_rank': float(np.max(closing_ranks)),
                        'candidate_position': self._calculate_candidate_position(candidate_air, closing_ranks),
                        'years_with_data': len(closing_ranks),
                        'success_probability': self._calculate_success_probability(candidate_air, closing_ranks)
                    }
            
            # Calculate round progression patterns
            round_analysis['progression_patterns'] = self._analyze_round_progression(filtered_data)
            
            return round_analysis
            
        except Exception as e:
            return {'error': f'Historical analysis error: {e}'}
    
    def _calculate_candidate_position(self, candidate_air: int, historical_ranks: np.ndarray) -> Dict[str, Any]:
        """Calculate candidate's position relative to historical closing ranks"""
        if len(historical_ranks) == 0:
            return {'percentile': 0, 'interpretation': 'No data available'}
        
        # Calculate percentile position
        percentile = stats.percentileofscore(historical_ranks, candidate_air)
        
        # Determine interpretation
        if percentile <= 25:
            interpretation = 'Excellent chances - well within historical range'
        elif percentile <= 50:
            interpretation = 'Good chances - above median historical performance'
        elif percentile <= 75:
            interpretation = 'Moderate chances - within typical range'
        elif percentile <= 90:
            interpretation = 'Lower chances - near historical cutoffs'
        else:
            interpretation = 'Very low chances - above most historical cutoffs'
        
        return {
            'percentile': float(percentile),
            'interpretation': interpretation,
            'ranks_better_than': int(np.sum(historical_ranks > candidate_air)),
            'total_historical_data_points': len(historical_ranks)
        }
    
    def _calculate_success_probability(self, candidate_air: int, historical_ranks: np.ndarray) -> float:
        """Calculate probability of success based on historical data"""
        if len(historical_ranks) == 0:
            return 0.0
        
        # Count how many times the candidate would have succeeded
        successes = np.sum(historical_ranks >= candidate_air)
        total_attempts = len(historical_ranks)
        
        # Apply Bayesian adjustment for small sample sizes
        alpha = 1  # Prior successes
        beta = 1   # Prior failures
        
        adjusted_probability = (successes + alpha) / (total_attempts + alpha + beta)
        
        return float(adjusted_probability)
    
    def _analyze_round_progression(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze how closing ranks change across rounds"""
        progression = {}
        
        try:
            # Group by year and analyze round-wise changes
            yearly_progression = {}
            
            for year in data['year'].unique():
                year_data = data[data['year'] == year].sort_values('round')
                
                if len(year_data) > 1:
                    ranks_by_round = year_data['closing_rank'].values
                    rounds = year_data['round'].values
                    
                    # Calculate round-to-round changes
                    changes = []
                    for i in range(1, len(ranks_by_round)):
                        change = ranks_by_round[i] - ranks_by_round[i-1]
                        changes.append({
                            'from_round': int(rounds[i-1]),
                            'to_round': int(rounds[i]),
                            'rank_change': float(change),
                            'percent_change': float(change / ranks_by_round[i-1] * 100) if ranks_by_round[i-1] > 0 else 0
                        })
                    
                    yearly_progression[str(year)] = {
                        'closing_ranks': ranks_by_round.tolist(),
                        'rounds': rounds.tolist(),
                        'round_changes': changes
                    }
            
            progression['yearly_patterns'] = yearly_progression
            
            # Calculate overall trends
            if yearly_progression:
                all_changes = []
                for year_data in yearly_progression.values():
                    for change in year_data['round_changes']:
                        all_changes.append(change['percent_change'])
                
                if all_changes:
                    progression['overall_trends'] = {
                        'average_round_change_percent': float(np.mean(all_changes)),
                        'std_round_change_percent': float(np.std(all_changes)),
                        'typical_pattern': 'increasing' if np.mean(all_changes) > 0 else 'decreasing'
                    }
            
        except Exception as e:
            progression['error'] = str(e)
        
        return progression
    
    def _calculate_round_probabilities(self, predicted_rank: float, 
                                     institute_course_combo: Dict[str, str],
                                     round_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate probability of admission in each round"""
        round_probabilities = {}
        
        # Base probability calculation using historical data
        for round_key, round_data in round_analysis.items():
            if round_key.startswith('round_') and 'success_probability' in round_data:
                round_num = int(round_key.split('_')[1])
                
                # Base probability from historical success rate
                base_prob = round_data['success_probability']
                
                # Adjust based on predicted rank vs historical median
                historical_median = round_data.get('median_closing_rank', predicted_rank)
                
                if historical_median > 0:
                    rank_adjustment = np.exp(-(predicted_rank - historical_median) / historical_median)
                    adjusted_prob = base_prob * rank_adjustment
                else:
                    adjusted_prob = base_prob
                
                # Ensure probability is within [0, 1]
                adjusted_prob = max(0.0, min(1.0, adjusted_prob))
                
                round_probabilities[f'round_{round_num}'] = {
                    'probability': float(adjusted_prob),
                    'confidence': self._calculate_prediction_confidence(round_data),
                    'historical_median_rank': float(historical_median),
                    'candidate_rank_difference': float(predicted_rank - historical_median),
                    'interpretation': self._interpret_round_probability(adjusted_prob)
                }
        
        # Calculate cumulative probabilities
        cumulative_probs = self._calculate_cumulative_probabilities(round_probabilities)
        round_probabilities['cumulative_probabilities'] = cumulative_probs
        
        # Determine most likely admission round
        best_round = self._determine_optimal_round(round_probabilities)
        round_probabilities['optimal_round'] = best_round
        
        return round_probabilities
    
    def _calculate_prediction_confidence(self, round_data: Dict[str, Any]) -> str:
        """Calculate confidence level in the prediction"""
        years_of_data = round_data.get('years_with_data', 0)
        std_rank = round_data.get('std_closing_rank', 0)
        mean_rank = round_data.get('mean_closing_rank', 1)
        
        # Coefficient of variation as stability measure
        cv = std_rank / mean_rank if mean_rank > 0 else 1
        
        # Confidence based on data availability and stability
        if years_of_data >= 2 and cv < 0.2:
            return 'High'
        elif years_of_data >= 1 and cv < 0.4:
            return 'Medium'
        else:
            return 'Low'
    
    def _interpret_round_probability(self, probability: float) -> str:
        """Provide human-readable interpretation of probability"""
        if probability >= 0.8:
            return 'Very High - Strong likelihood of admission'
        elif probability >= 0.6:
            return 'High - Good chances of admission'
        elif probability >= 0.4:
            return 'Moderate - Fair chances, consider as backup'
        elif probability >= 0.2:
            return 'Low - Unlikely but possible'
        else:
            return 'Very Low - Admission highly unlikely'
    
    def _calculate_cumulative_probabilities(self, round_probs: Dict[str, Any]) -> Dict[str, float]:
        """Calculate cumulative probability of admission by each round"""
        cumulative = {}
        total_prob = 0.0
        
        # Sort rounds numerically
        round_nums = []
        for key in round_probs.keys():
            if key.startswith('round_'):
                round_nums.append(int(key.split('_')[1]))
        
        round_nums.sort()
        
        for round_num in round_nums:
            round_key = f'round_{round_num}'
            if round_key in round_probs:
                round_prob = round_probs[round_key]['probability']
                # Cumulative probability = 1 - (1-p1)*(1-p2)*...*(1-pn)
                total_prob = 1 - (1 - total_prob) * (1 - round_prob)
                cumulative[round_key] = float(total_prob)
        
        return cumulative
    
    def _determine_optimal_round(self, round_probs: Dict[str, Any]) -> Dict[str, Any]:
        """Determine the most likely round for admission"""
        best_prob = 0.0
        best_round = None
        
        for key, data in round_probs.items():
            if key.startswith('round_') and isinstance(data, dict):
                prob = data.get('probability', 0)
                if prob > best_prob:
                    best_prob = prob
                    best_round = int(key.split('_')[1])
        
        if best_round is None:
            return {'round': None, 'probability': 0.0, 'recommendation': 'Insufficient data'}
        
        return {
            'round': best_round,
            'probability': float(best_prob),
            'recommendation': f'Most likely to get admission in Round {best_round}',
            'confidence': round_probs.get(f'round_{best_round}', {}).get('confidence', 'Unknown')
        }
    
    def _calculate_confidence_intervals(self, feature_vector: np.ndarray, 
                                      round_probs: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence intervals for predictions"""
        confidence_intervals = {}
        
        try:
            # For each round with probability data
            for key, data in round_probs.items():
                if key.startswith('round_') and isinstance(data, dict):
                    prob = data.get('probability', 0)
                    confidence = data.get('confidence', 'Low')
                    
                    # Calculate interval width based on confidence level
                    if confidence == 'High':
                        margin = 0.05  # ±5%
                    elif confidence == 'Medium':
                        margin = 0.10  # ±10%
                    else:
                        margin = 0.15  # ±15%
                    
                    lower_bound = max(0.0, prob - margin)
                    upper_bound = min(1.0, prob + margin)
                    
                    confidence_intervals[key] = {
                        'lower_bound': float(lower_bound),
                        'upper_bound': float(upper_bound),
                        'margin_of_error': float(margin),
                        'confidence_level': confidence
                    }
        
        except Exception as e:
            confidence_intervals['error'] = str(e)
        
        return confidence_intervals
    
    def _generate_counseling_strategy(self, round_probs: Dict[str, Any], 
                                    confidence_intervals: Dict[str, Any],
                                    candidate_features: Dict[str, Any]) -> Dict[str, Any]:
        """Generate optimal counseling strategy recommendations"""
        strategy = {
            'recommended_approach': '',
            'priority_rounds': [],
            'backup_options': [],
            'risk_assessment': '',
            'specific_recommendations': []
        }
        
        try:
            # Extract round probabilities
            round_data = []
            for key, data in round_probs.items():
                if key.startswith('round_') and isinstance(data, dict):
                    round_num = int(key.split('_')[1])
                    prob = data.get('probability', 0)
                    confidence = data.get('confidence', 'Low')
                    round_data.append((round_num, prob, confidence))
            
            # Sort by probability
            round_data.sort(key=lambda x: x[1], reverse=True)
            
            # Determine strategy based on probability distribution
            if not round_data:
                strategy['recommended_approach'] = 'Insufficient data for strategy recommendation'
                return strategy
            
            best_round, best_prob, best_confidence = round_data[0]
            
            if best_prob >= 0.7:
                strategy['recommended_approach'] = 'Aggressive - Focus on preferred choices'
                strategy['risk_assessment'] = 'Low risk - High probability of admission'
            elif best_prob >= 0.4:
                strategy['recommended_approach'] = 'Balanced - Mix of preferred and safe choices'
                strategy['risk_assessment'] = 'Medium risk - Good chances but prepare alternatives'
            else:
                strategy['recommended_approach'] = 'Conservative - Focus on safety options'
                strategy['risk_assessment'] = 'High risk - Consider widening criteria'
            
            # Priority rounds (top 3 or those with >30% probability)
            priority_threshold = max(0.3, best_prob * 0.5)
            for round_num, prob, confidence in round_data:
                if prob >= priority_threshold and len(strategy['priority_rounds']) < 3:
                    strategy['priority_rounds'].append({
                        'round': round_num,
                        'probability': float(prob),
                        'confidence': confidence,
                        'recommendation': f'Strong candidate for Round {round_num}'
                    })
            
            # Backup options (remaining rounds with >10% probability)
            for round_num, prob, confidence in round_data:
                if 0.1 <= prob < priority_threshold and len(strategy['backup_options']) < 2:
                    strategy['backup_options'].append({
                        'round': round_num,
                        'probability': float(prob),
                        'confidence': confidence,
                        'recommendation': f'Consider as backup in Round {round_num}'
                    })
            
            # Specific recommendations based on analysis
            strategy['specific_recommendations'] = self._generate_specific_recommendations(
                round_data, candidate_features
            )
            
        except Exception as e:
            strategy['error'] = str(e)
        
        return strategy
    
    def _generate_specific_recommendations(self, round_data: List[Tuple], 
                                         candidate_features: Dict[str, Any]) -> List[str]:
        """Generate specific actionable recommendations"""
        recommendations = []
        
        if not round_data:
            return ['Insufficient data for specific recommendations']
        
        best_round, best_prob, best_confidence = round_data[0]
        candidate_air = candidate_features.get('air', 50000)
        
        # Based on probability distribution
        if best_prob >= 0.8:
            recommendations.append(f"Your chances are excellent for Round {best_round}. Focus on your preferred specializations.")
        elif best_prob >= 0.5:
            recommendations.append(f"Good chances in Round {best_round}. Prepare 2-3 backup options.")
        else:
            recommendations.append("Consider broadening your criteria or exploring additional quotas.")
        
        # Based on AIR range
        if candidate_air <= 10000:
            recommendations.append("With your excellent rank, consider top-tier government colleges.")
        elif candidate_air <= 50000:
            recommendations.append("You have good options in both government and private sectors.")
        else:
            recommendations.append("Focus on private colleges and deemed universities for better chances.")
        
        # Based on confidence levels
        high_conf_rounds = [r[0] for r in round_data if r[2] == 'High']
        if high_conf_rounds:
            recommendations.append(f"Rounds {', '.join(map(str, high_conf_rounds))} have reliable historical data.")
        
        # Round-specific advice
        early_rounds = [r for r in round_data if r[0] <= 2 and r[1] > 0.3]
        if early_rounds:
            recommendations.append("Strong chances in early rounds - prepare documents well in advance.")
        
        later_rounds = [r for r in round_data if r[0] >= 4 and r[1] > 0.3]
        if later_rounds:
            recommendations.append("Significant opportunities in later rounds - don't lose hope if early rounds don't work out.")
        
        return recommendations
    
    def _generate_recommendations(self, round_probs: Dict[str, Any], 
                                strategy: Dict[str, Any], 
                                candidate_features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive recommendations"""
        recommendations = []
        
        # Strategic recommendations
        if strategy.get('recommended_approach'):
            recommendations.append({
                'type': 'strategy',
                'title': 'Overall Strategy',
                'description': strategy['recommended_approach'],
                'priority': 'high'
            })
        
        # Round-specific recommendations
        optimal_round = round_probs.get('optimal_round', {})
        if optimal_round.get('round'):
            recommendations.append({
                'type': 'round_focus',
                'title': f'Focus on Round {optimal_round["round"]}',
                'description': optimal_round.get('recommendation', ''),
                'probability': optimal_round.get('probability', 0),
                'priority': 'high'
            })
        
        # Risk mitigation
        if strategy.get('risk_assessment'):
            recommendations.append({
                'type': 'risk_management',
                'title': 'Risk Assessment',
                'description': strategy['risk_assessment'],
                'priority': 'medium'
            })
        
        # Specific actionable items
        for rec in strategy.get('specific_recommendations', []):
            recommendations.append({
                'type': 'actionable',
                'title': 'Action Item',
                'description': rec,
                'priority': 'medium'
            })
        
        return recommendations

# Example usage and testing
if __name__ == "__main__":
    # Initialize the advanced round prediction engine
    engine = AdvancedRoundPredictionEngine()
    
    # Test prediction
    test_candidate = {
        'air': 25000,
        'annual_fees': 50000,
        'stipend_year1': 60000,
        'bond_years': 2,
        'bond_amount': 4000000,
        'total_beds': 500
    }
    
    test_combo = {
        'institute': 'GOVT MED COLL, BANGALORE',
        'course': 'ANAESTHESIOLOGY',
        'category': 'OPEN-GEN',
        'quota': 'KAR GOVT QUOTA-OPEN'
    }
    
    # Generate predictions
    result = engine.predict_round_probabilities(test_candidate, test_combo)
    
    # Print results
    print(json.dumps(result, indent=2))