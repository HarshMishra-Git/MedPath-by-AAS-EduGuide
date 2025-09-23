#!/usr/bin/env python3
"""
Enhanced NEET-PG College Prediction Algorithm
=============================================
Implements round-aware probability calculation using historical closing ranks
with flexible rank range matching and smooth probability functions.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class EnhancedPredictionAlgorithm:
    """
    Enhanced college prediction algorithm that provides predictions closer to 
    what an experienced admission counselor would offer.
    """
    
    def __init__(self, csv_file_path: str = "data/raw/Neet-PG.csv"):
        """Initialize the enhanced prediction algorithm"""
        self.csv_file_path = csv_file_path
        self.data = None
        self.cr_columns = []
        
    def load_data(self) -> bool:
        """Load and process the raw CSV data"""
        try:
            logger.info(f"Loading data from {self.csv_file_path}")
            self.data = pd.read_csv(self.csv_file_path)
            
            # Clean column names - remove any BOM characters
            self.data.columns = [col.strip().replace('\ufeff', '') for col in self.data.columns]
            
            # Identify CR (closing rank) columns
            self.cr_columns = [col for col in self.data.columns if col.startswith('CR ')]
            logger.info(f"Found {len(self.cr_columns)} closing rank columns")
            logger.info(f"CR columns: {self.cr_columns}")
            
            # Clean and convert CR columns to numeric
            for col in self.cr_columns:
                # Replace '-' with NaN and convert to numeric
                self.data[col] = pd.to_numeric(self.data[col].replace('-', np.nan), errors='coerce')
            
            # Clean other numeric columns
            numeric_columns = ['Bond Years', 'Beds']
            for col in numeric_columns:
                if col in self.data.columns:
                    self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
            
            # Clean fee and stipend columns (remove currency symbols and commas)
            money_columns = ['Fee', 'Stipend Year 1', 'Bond Penalty']
            for col in money_columns:
                if col in self.data.columns:
                    self.data[col] = self.data[col].astype(str).str.replace('₹', '').str.replace(',', '').str.replace(' ', '')
                    self.data[col] = pd.to_numeric(self.data[col], errors='coerce')
            
            logger.info(f"Data loaded successfully: {len(self.data)} records")
            return True
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return False
    
    def calculate_round_probability(self, user_rank: int, closing_rank: float) -> float:
        """
        Calculate admission probability for a specific round based on user rank 
        and historical closing rank with smooth probability function.
        """
        if pd.isna(closing_rank) or closing_rank == 0:
            return 0.0
        
        # Calculate absolute difference between user rank and closing rank
        diff = abs(user_rank - closing_rank)
        
        # Smooth probability function based on rank difference
        if diff <= 10000:
            # High probability zone - linear decrease from 0.95 to 0.5
            probability = 0.95 - 0.000045 * diff
        elif diff <= 20000:
            # Medium probability zone - linear decrease from 0.5 to 0.1
            probability = 0.5 - 0.00004 * (diff - 10000)
        elif diff <= 40000:
            # Low probability zone - linear decrease from 0.1 to 0.01
            probability = 0.1 - 0.0000045 * (diff - 20000)
        else:
            # Very low probability zone
            probability = 0.01
        
        return max(0.01, min(0.95, probability))
    
    def extract_round_data(self, row: pd.Series) -> Dict[str, Any]:
        """
        Extract closing ranks per round from a row and calculate probabilities.
        """
        round_data = {
            'closing_ranks': {},
            'probabilities': {},
            'round_info': {}
        }
        
        for col in self.cr_columns:
            if pd.notna(row[col]) and row[col] > 0:
                # Extract year and round from column name (e.g., 'CR 2023 1' -> year=2023, round=1)
                parts = col.split()
                if len(parts) >= 3:
                    try:
                        year = int(parts[1])
                        round_num = int(parts[2])
                        round_key = f"{year}_R{round_num}"
                        
                        round_data['closing_ranks'][round_key] = float(row[col])
                        round_data['round_info'][round_key] = {
                            'year': year,
                            'round': round_num,
                            'closing_rank': float(row[col])
                        }
                    except (ValueError, IndexError):
                        continue
        
        return round_data
    
    def calculate_admission_probabilities(self, user_rank: int, round_data: Dict) -> Dict[str, Any]:
        """
        Calculate admission probabilities for all available rounds.
        """
        if not round_data['closing_ranks']:
            return {
                'round_probabilities': {},
                'best_round': None,
                'overall_probability': 0.05,
                'predicted_closing_rank': user_rank + 5000
            }
        
        round_probabilities = {}
        for round_key, closing_rank in round_data['closing_ranks'].items():
            probability = self.calculate_round_probability(user_rank, closing_rank)
            round_probabilities[round_key] = probability
        
        # Find best round (highest probability)
        best_round = max(round_probabilities, key=round_probabilities.get) if round_probabilities else None
        overall_probability = max(round_probabilities.values()) if round_probabilities else 0.05
        
        # Use the closing rank from the best round as predicted closing rank
        if best_round and best_round in round_data['closing_ranks']:
            predicted_closing_rank = round_data['closing_ranks'][best_round]
        else:
            # Fallback: estimate based on average of available ranks
            available_ranks = list(round_data['closing_ranks'].values())
            predicted_closing_rank = np.mean(available_ranks) if available_ranks else user_rank + 5000
        
        return {
            'round_probabilities': round_probabilities,
            'best_round': best_round,
            'overall_probability': overall_probability,
            'predicted_closing_rank': int(predicted_closing_rank)
        }
    
    def calculate_enhanced_recommendation_score(self, row: pd.Series, user_rank: int, 
                                               admission_data: Dict, preferences: Dict) -> float:
        """
        Calculate enhanced recommendation score using admission probability as primary factor.
        """
        score = 0.0
        
        # Base admission probability score (50% weight) - PRIMARY FACTOR
        admission_prob = admission_data['overall_probability']
        score += admission_prob * 0.5
        
        # Rank competitiveness bonus (15% weight)
        predicted_rank = admission_data.get('predicted_closing_rank', user_rank + 5000)
        if user_rank <= predicted_rank:
            # User rank is better than predicted closing rank
            competitiveness_bonus = min(0.15, (predicted_rank - user_rank) / predicted_rank * 0.15)
            score += competitiveness_bonus
        
        # Institute type preference (10% weight)
        quota = row.get('Quota', '')
        if 'Govt' in str(quota) or 'Government' in str(quota):
            score += 0.1
        elif 'Private' in str(quota):
            score += 0.05
        
        # Fee affordability (10% weight)
        if pd.notna(row.get('Fee')):
            annual_fee = row['Fee']
            if annual_fee <= 100000:  # Low fees
                score += 0.1
            elif annual_fee <= 500000:  # Medium fees
                score += 0.05
        else:
            score += 0.05  # Neutral for unknown fees
        
        # Stipend bonus (5% weight)
        if pd.notna(row.get('Stipend Year 1')) and row['Stipend Year 1'] > 0:
            score += 0.05
        
        # Bond penalty (5% weight) - negative for high bond years
        if pd.notna(row.get('Bond Years')):
            bond_years = row['Bond Years']
            if bond_years == 0:
                score += 0.05
            elif bond_years <= 2:
                score += 0.025
            elif bond_years > 5:
                score -= 0.025
        
        # State preference (5% weight)
        if row.get('State', '').upper() == preferences.get('preferred_state', '').upper():
            score += 0.05
        
        return max(0.0, min(1.0, score))
    
    def predict_colleges(self, user_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main prediction function using enhanced round-aware algorithm.
        """
        if self.data is None:
            if not self.load_data():
                return {"error": "Failed to load data"}
        
        try:
            # Extract user inputs
            category = user_inputs.get('category', '')
            state = user_inputs.get('state', '')
            course = user_inputs.get('course', '')
            quota = user_inputs.get('quota', '')
            user_rank = user_inputs.get('air', 0)
            
            logger.info(f"Predicting for AIR: {user_rank}, Category: {category}, State: {state}, Course: {course}, Quota: {quota}")
            
            # Apply filters to the data
            filtered_data = self.data.copy()
            
            # Category filter
            if category:
                filtered_data = filtered_data[filtered_data['Category'].str.upper().str.contains(category.upper(), na=False)]
            
            # State filter  
            if state:
                filtered_data = filtered_data[filtered_data['State'].str.upper().str.contains(state.upper(), na=False)]
            
            # Course filter
            if course:
                filtered_data = filtered_data[filtered_data['Course'].str.upper().str.contains(course.upper(), na=False)]
            
            # Quota filter
            if quota:
                filtered_data = filtered_data[filtered_data['Quota'].str.upper().str.contains(quota.upper(), na=False)]
            
            logger.info(f"After filtering: {len(filtered_data)} records found")
            
            if filtered_data.empty:
                return {
                    "predictions": [],
                    "total_colleges_found": 0,
                    "message": "No colleges found matching your criteria. Try broadening your search parameters."
                }
            
            # Generate predictions
            predictions = []
            preferences = {
                'preferred_state': state
            }
            
            for idx, row in filtered_data.iterrows():
                # Extract round-wise closing rank data
                round_data = self.extract_round_data(row)
                
                # Calculate admission probabilities
                admission_data = self.calculate_admission_probabilities(user_rank, round_data)
                
                # Only include colleges with reasonable admission probability
                if admission_data['overall_probability'] < 0.05:
                    continue
                
                # Calculate enhanced recommendation score
                recommendation_score = self.calculate_enhanced_recommendation_score(
                    row, user_rank, admission_data, preferences
                )
                
                # Create prediction entry
                prediction = {
                    'institute': str(row.get('Institute', '')),
                    'course': str(row.get('Course', '')),
                    'state': str(row.get('State', '')),
                    'category': str(row.get('Category', '')),
                    'quota': str(row.get('Quota', '')),
                    'admission_probability': round(admission_data['overall_probability'], 3),
                    'confidence_score': min(0.95, admission_data['overall_probability'] + 0.1),
                    'predicted_closing_rank': admission_data['predicted_closing_rank'],
                    'round_predictions': {
                        'most_likely_round': admission_data['best_round'],
                        'round_probabilities': admission_data['round_probabilities']
                    },
                    'confidence_intervals': {
                        'lower_bound': max(1, admission_data['predicted_closing_rank'] - 5000),
                        'upper_bound': admission_data['predicted_closing_rank'] + 10000,
                        'confidence_level': 0.8
                    },
                    'college_details': {
                        'annual_fees': str(row.get('Fee', 'Not available')),
                        'stipend_year1': str(row.get('Stipend Year 1', 'Not available')),
                        'bond_years': str(row.get('Bond Years', 'Not available')),
                        'bond_amount': str(row.get('Bond Penalty', 'Not available')),
                        'total_beds': str(row.get('Beds', 'Not available'))
                    },
                    'historical_trends': {
                        'volatility': 'Medium',
                        'trend_direction': 'Stable',
                        'data_years': len(set([info['year'] for info in round_data['round_info'].values()]))
                    },
                    'recommendation_score': round(recommendation_score, 3)
                }
                
                predictions.append(prediction)
            
            # Sort by recommendation score (descending)
            predictions.sort(key=lambda x: x['recommendation_score'], reverse=True)
            
            # Limit to top predictions
            max_predictions = 50
            predictions = predictions[:max_predictions]
            
            logger.info(f"Generated {len(predictions)} predictions")
            
            # Generate comparative analysis
            comparative_analysis = self._generate_comparative_analysis(predictions, user_rank)
            
            return {
                "predictions": predictions,
                "total_colleges_found": len(predictions),
                "comparative_analysis": comparative_analysis,
                "algorithm_version": "enhanced_v1.0"
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return {"error": f"Prediction failed: {str(e)}"}
    
    def _generate_comparative_analysis(self, predictions: List[Dict], user_rank: int) -> Dict[str, Any]:
        """Generate comparative analysis of predictions"""
        if not predictions:
            return {}
        
        admission_probs = [p['admission_probability'] for p in predictions]
        fees = [float(str(p['college_details']['annual_fees']).replace('Not available', '0')) 
                for p in predictions]
        fees = [f for f in fees if f > 0]
        
        analysis = {
            'probability_distribution': {
                'high_probability': len([p for p in admission_probs if p > 0.7]),
                'medium_probability': len([p for p in admission_probs if 0.4 <= p <= 0.7]),
                'low_probability': len([p for p in admission_probs if p < 0.4]),
                'average_probability': round(np.mean(admission_probs), 3)
            },
            'fee_analysis': {
                'min_fee': min(fees) if fees else 0,
                'max_fee': max(fees) if fees else 0,
                'average_fee': round(np.mean(fees)) if fees else 0
            },
            'recommendation_summary': {
                'total_options': len(predictions),
                'best_recommendation': predictions[0]['institute'] if predictions else None,
                'user_rank_percentile': self._calculate_rank_percentile(user_rank)
            }
        }
        
        return analysis
    
    def _calculate_rank_percentile(self, user_rank: int) -> str:
        """Calculate approximate percentile for user rank"""
        if user_rank <= 5000:
            return "Top 5%"
        elif user_rank <= 15000:
            return "Top 15%"
        elif user_rank <= 30000:
            return "Top 30%"
        elif user_rank <= 60000:
            return "Top 60%"
        else:
            return "Above 60%"

# Standalone prediction function for easy integration
def run_enhanced_prediction(user_inputs: Dict[str, Any], csv_file_path: str = "data/raw/Neet-PG.csv") -> Dict[str, Any]:
    """
    Standalone function to run enhanced prediction
    """
    predictor = EnhancedPredictionAlgorithm(csv_file_path)
    return predictor.predict_colleges(user_inputs)

if __name__ == "__main__":
    # Test the enhanced prediction algorithm
    test_inputs = {
        'category': 'OPEN-GEN',
        'state': 'Andhra Pradesh',
        'course': 'ANAESTHESIOLOGY',
        'quota': 'AP Govt-NS LOC',
        'air': 25000
    }
    
    predictor = EnhancedPredictionAlgorithm()
    results = predictor.predict_colleges(test_inputs)
    
    if 'error' in results:
        print(f"Error: {results['error']}")
    else:
        print(f"Found {results['total_colleges_found']} predictions")
        for pred in results['predictions'][:5]:
            print(f"- {pred['institute']}: {pred['admission_probability']:.3f} probability, score: {pred['recommendation_score']:.3f}")