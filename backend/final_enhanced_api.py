#!/usr/bin/env python3
"""
NEET-PG College Finder - Final Enhanced API
============================================
Combines cascading filters with enhanced prediction algorithm
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import json
import os
from pathlib import Path
import logging
import sys

# Add the enhanced prediction algorithm
sys.path.append(os.path.dirname(__file__))
from enhanced_prediction_algorithm import EnhancedPredictionAlgorithm

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NEET-PG College Finder - Final Enhanced API",
    description="AI-powered college prediction with cascading filters and enhanced algorithm",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data variables
main_data = None
state_quota_mapping = None
quota_categories_mapping = None
state_courses_mapping = None
enhanced_predictor = None

class FilterOptionsResponse(BaseModel):
    states: List[str]
    quotas_by_state: Dict[str, List[str]]
    categories_by_quota: Dict[str, List[str]]
    courses_by_state: Dict[str, List[str]]
    total_records: int

class CascadingFiltersRequest(BaseModel):
    state: Optional[str] = None
    quota: Optional[str] = None
    
class QuotaOptionsResponse(BaseModel):
    quotas: List[str]
    
class CategoryOptionsResponse(BaseModel):
    categories: List[str]

class CourseOptionsResponse(BaseModel):
    courses: List[str]

class CollegeSearchRequest(BaseModel):
    state: str = Field(..., description="Selected state")
    quota: str = Field(..., description="Selected quota for the state")
    category: str = Field(..., description="Student category")
    course: str = Field(..., description="Medical course")
    air: int = Field(..., ge=1, le=200000, description="All India Rank")
    
    # Optional filters
    include_government: Optional[bool] = Field(True, description="Include government colleges")
    include_private: Optional[bool] = Field(True, description="Include private colleges")

class CollegePrediction(BaseModel):
    institute: str
    course: str
    state: str
    category: str
    quota: str
    admission_probability: float
    predicted_closing_rank: Optional[int]
    annual_fees: str
    stipend_year1: str
    bond_years: str
    bond_amount: str
    total_beds: str
    recommendation_score: float
    institute_type: str
    confidence_score: Optional[float] = None
    round_predictions: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseModel):
    user_query: CollegeSearchRequest
    total_colleges_found: int
    predictions: List[CollegePrediction]
    processing_time_ms: int
    filters_applied: Dict[str, Any]

@app.on_event("startup")
async def startup_event():
    """Initialize data and create mappings"""
    global main_data, state_quota_mapping, quota_categories_mapping, state_courses_mapping, enhanced_predictor
    
    try:
        print("🚀 Loading NEET-PG data for Final Enhanced API...")
        
        # Initialize enhanced predictor
        logger.info("Initializing enhanced prediction algorithm...")
        enhanced_predictor = EnhancedPredictionAlgorithm("data/raw/Neet-PG.csv")
        if enhanced_predictor.load_data():
            logger.info("✅ Enhanced predictor initialized successfully")
            # Use the same data for cascading filters
            main_data = enhanced_predictor.data.copy()
        else:
            logger.error("❌ Enhanced predictor failed to initialize")
            # Fallback: Load data directly
            main_data = pd.read_csv("data/raw/Neet-PG.csv", encoding='utf-8')
            enhanced_predictor = None
        
        print(f"Loaded data: {len(main_data):,} records")
        
        # Clean currency columns if needed (for backward compatibility)
        for col in ['Fee', 'Stipend Year 1', 'Bond Penalty']:
            if col in main_data.columns:
                main_data[f'{col}_cleaned'] = main_data[col].astype(str).str.replace('₹', '').str.replace(',', '').str.replace('Info not available', '0')
                main_data[f'{col}_cleaned'] = pd.to_numeric(main_data[f'{col}_cleaned'], errors='coerce').fillna(0)
        
        # Clean other columns
        main_data['Beds_cleaned'] = pd.to_numeric(main_data['Beds'], errors='coerce').fillna(0)
        main_data['Bond Years_cleaned'] = pd.to_numeric(main_data['Bond Years'], errors='coerce').fillna(0)
        
        # Create mappings for cascading filters
        print("Creating filter mappings...")
        
        # 1. State -> Quotas mapping
        state_quota_mapping = {}
        for state in main_data['State'].unique():
            quotas = main_data[main_data['State'] == state]['Quota'].unique().tolist()
            state_quota_mapping[state] = sorted([q for q in quotas if pd.notna(q)])
        
        # 2. State+Quota -> Categories mapping
        quota_categories_mapping = {}
        for state in main_data['State'].unique():
            state_quotas = main_data[main_data['State'] == state]
            for quota in state_quotas['Quota'].unique():
                key = f"{state}_{quota}"
                categories = state_quotas[state_quotas['Quota'] == quota]['Category'].unique().tolist()
                quota_categories_mapping[key] = sorted([c for c in categories if pd.notna(c)])
        
        # 3. State -> Courses mapping
        state_courses_mapping = {}
        for state in main_data['State'].unique():
            courses = main_data[main_data['State'] == state]['Course'].unique().tolist()
            state_courses_mapping[state] = sorted([c for c in courses if pd.notna(c)])
        
        print("✅ Final Enhanced API initialization completed!")
        print(f"   🏛️ States: {len(state_quota_mapping)}")
        print(f"   🎯 Total unique quotas: {main_data['Quota'].nunique()}")
        print(f"   📚 Total courses: {main_data['Course'].nunique()}")
        print(f"   👥 Total categories: {main_data['Category'].nunique()}")
        print(f"   🤖 Enhanced Algorithm: {'Enabled' if enhanced_predictor else 'Disabled (Fallback)'}")
        
    except Exception as e:
        print(f"❌ Failed to initialize Final Enhanced API: {e}")

def calculate_admission_probability_fallback(air: int, historical_ranks: List[int]) -> float:
    """Fallback admission probability calculation if enhanced algorithm fails"""
    if not historical_ranks:
        return 0.1
    
    valid_ranks = [r for r in historical_ranks if r > 0]
    if not valid_ranks:
        return 0.1
    
    avg_closing_rank = np.mean(valid_ranks)
    
    if air <= avg_closing_rank:
        ratio = air / avg_closing_rank
        probability = min(0.95, 1.0 - ratio * 0.2)
    else:
        ratio = air / avg_closing_rank
        if ratio <= 2.0:
            probability = max(0.05, 0.6 - (ratio - 1.0) * 0.4)
        else:
            probability = 0.05
    
    return round(probability, 3)

def get_historical_closing_ranks_fallback(row) -> List[int]:
    """Fallback function to extract historical closing ranks"""
    ranks = []
    cr_columns = [col for col in row.index if 'CR 202' in str(col)]
    
    for col in cr_columns:
        try:
            rank = row[col]
            if pd.notna(rank) and str(rank) != '-' and float(rank) > 0:
                ranks.append(int(float(rank)))
        except:
            continue
    
    return ranks

@app.get("/")
async def root():
    return {
        "message": "NEET-PG College Finder Final Enhanced API", 
        "version": "3.0.0",
        "features": [
            "Enhanced prediction algorithm with round-aware calculations",
            "Cascading filters (State → Quota → Category → Course)",
            "Smooth probability functions",
            "Historical rank analysis",
            "Confidence intervals"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "data_loaded": main_data is not None,
        "total_records": len(main_data) if main_data is not None else 0,
        "states_available": len(state_quota_mapping) if state_quota_mapping else 0,
        "enhanced_algorithm": enhanced_predictor is not None
    }

@app.get("/filter-options", response_model=FilterOptionsResponse)
async def get_all_filter_options():
    """Get all available filter options with relationships"""
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    return FilterOptionsResponse(
        states=sorted(list(state_quota_mapping.keys())),
        quotas_by_state=state_quota_mapping,
        categories_by_quota=quota_categories_mapping,
        courses_by_state=state_courses_mapping,
        total_records=len(main_data)
    )

@app.get("/states")
async def get_states():
    """Get all available states"""
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    states = sorted(main_data['State'].unique().tolist())
    return {"states": states}

@app.get("/quotas/{state}", response_model=QuotaOptionsResponse)
async def get_quotas_for_state(state: str):
    """Get available quotas for a specific state"""
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    if state not in state_quota_mapping:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found")
    
    return QuotaOptionsResponse(quotas=state_quota_mapping[state])

@app.get("/categories/{state}/{quota}", response_model=CategoryOptionsResponse)
async def get_categories_for_state_quota(state: str, quota: str):
    """Get available categories for a specific state and quota"""
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    key = f"{state}_{quota}"
    if key not in quota_categories_mapping:
        raise HTTPException(status_code=404, detail=f"No categories found for state '{state}' and quota '{quota}'")
    
    return CategoryOptionsResponse(categories=quota_categories_mapping[key])

@app.get("/courses/{state}", response_model=CourseOptionsResponse)
async def get_courses_for_state(state: str):
    """Get available courses for a specific state"""
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    if state not in state_courses_mapping:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found")
    
    return CourseOptionsResponse(courses=state_courses_mapping[state])

@app.post("/predict", response_model=PredictionResponse)
async def predict_colleges(request: CollegeSearchRequest):
    """Get college predictions using enhanced algorithm with cascading filters"""
    import time
    start_time = time.time()
    
    if main_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    logger.info(f"🔍 Enhanced prediction request: {request.state} → {request.quota} → {request.category} → {request.course} (AIR: {request.air})")
    
    # Use enhanced predictor if available
    if enhanced_predictor:
        try:
            # Convert request to enhanced predictor format
            user_inputs = {
                'category': request.category,
                'state': request.state,
                'course': request.course,
                'quota': request.quota,
                'air': request.air
            }
            
            # Get enhanced predictions
            enhanced_results = enhanced_predictor.predict_colleges(user_inputs)
            
            if 'error' not in enhanced_results:
                logger.info(f"✅ Enhanced algorithm returned {len(enhanced_results['predictions'])} predictions")
                
                # Convert enhanced predictions to API format
                predictions = []
                for pred in enhanced_results['predictions']:
                    college_pred = CollegePrediction(
                        institute=pred['institute'],
                        course=pred['course'],
                        state=pred['state'],
                        category=pred['category'],
                        quota=pred['quota'],
                        admission_probability=pred['admission_probability'],
                        predicted_closing_rank=pred['predicted_closing_rank'],
                        annual_fees=pred['college_details']['annual_fees'],
                        stipend_year1=pred['college_details']['stipend_year1'],
                        bond_years=pred['college_details']['bond_years'],
                        bond_amount=pred['college_details']['bond_amount'],
                        total_beds=pred['college_details']['total_beds'],
                        recommendation_score=pred['recommendation_score'],
                        institute_type="Government" if "Govt" in pred['quota'] else "Private",
                        confidence_score=pred.get('confidence_score'),
                        round_predictions=pred.get('round_predictions')
                    )
                    predictions.append(college_pred)
                
                processing_time = int((time.time() - start_time) * 1000)
                
                return PredictionResponse(
                    user_query=request,
                    total_colleges_found=len(predictions),
                    predictions=predictions[:50],
                    processing_time_ms=processing_time,
                    filters_applied={
                        "enhanced_algorithm": "Used enhanced prediction algorithm",
                        "total_records_analyzed": enhanced_results.get("total_colleges_found", 0)
                    }
                )
            else:
                logger.warning(f"⚠️ Enhanced algorithm failed: {enhanced_results['error']}, falling back")
        except Exception as e:
            logger.error(f"❌ Enhanced algorithm error: {e}, falling back to basic algorithm")
    
    # Fallback to basic algorithm with cascading filters
    logger.info("🔄 Using fallback algorithm with cascading filters")
    
    # Apply cascading filters
    filtered_data = main_data.copy()
    filters_applied = {}
    
    # Filter by state
    filtered_data = filtered_data[filtered_data['State'] == request.state]
    filters_applied['state'] = f"Filtered to {request.state}: {len(filtered_data)} records"
    
    # Filter by quota
    filtered_data = filtered_data[filtered_data['Quota'] == request.quota]
    filters_applied['quota'] = f"Filtered to {request.quota}: {len(filtered_data)} records"
    
    # Filter by category
    filtered_data = filtered_data[filtered_data['Category'] == request.category]
    filters_applied['category'] = f"Filtered to {request.category}: {len(filtered_data)} records"
    
    # Filter by course
    filtered_data = filtered_data[filtered_data['Course'] == request.course]
    filters_applied['course'] = f"Filtered to {request.course}: {len(filtered_data)} records"
    
    logger.info(f"📊 Final filtered data: {len(filtered_data)} records")
    
    # Create predictions using fallback algorithm
    predictions = []
    
    for idx, row in filtered_data.iterrows():
        # Get historical closing ranks
        historical_ranks = get_historical_closing_ranks_fallback(row)
        
        # Calculate admission probability
        admission_prob = calculate_admission_probability_fallback(request.air, historical_ranks)
        
        # Skip very low probability colleges
        if admission_prob < 0.05:
            continue
        
        # Predict closing rank
        if historical_ranks:
            predicted_rank = int(np.mean(historical_ranks))
        else:
            predicted_rank = request.air + np.random.randint(1000, 10000)
        
        # Calculate recommendation score
        score = admission_prob * 0.6
        
        # Fee factor
        fee = row.get('Fee_cleaned', 0)
        if fee > 0:
            fee_score = max(0, 1 - (fee / 1000000))
            score += fee_score * 0.2
        
        # Stipend factor
        stipend = row.get('Stipend Year 1_cleaned', 0)
        if stipend > 0:
            stipend_score = min(1, stipend / 50000)
            score += stipend_score * 0.1
        
        # Bond factor
        bond_years = row.get('Bond Years_cleaned', 0)
        bond_score = max(0, 1 - (bond_years / 7))
        score += bond_score * 0.1
        
        prediction = CollegePrediction(
            institute=str(row.get('Institute', 'Unknown')),
            course=str(row.get('Course', 'Unknown')),
            state=str(row.get('State', 'Unknown')),
            category=str(row.get('Category', 'Unknown')),
            quota=str(row.get('Quota', 'Unknown')),
            admission_probability=admission_prob,
            predicted_closing_rank=predicted_rank,
            annual_fees=f"₹{row.get('Fee_cleaned', 0):,.0f}" if row.get('Fee_cleaned', 0) > 0 else "Not Available",
            stipend_year1=f"₹{row.get('Stipend Year 1_cleaned', 0):,.0f}" if row.get('Stipend Year 1_cleaned', 0) > 0 else "Not Available",
            bond_years=f"{row.get('Bond Years_cleaned', 0):.0f} years" if row.get('Bond Years_cleaned', 0) > 0 else "No Bond",
            bond_amount=f"₹{row.get('Bond Penalty_cleaned', 0):,.0f}" if row.get('Bond Penalty_cleaned', 0) > 0 else "No Penalty",
            total_beds=f"{row.get('Beds_cleaned', 0):.0f}" if row.get('Beds_cleaned', 0) > 0 else "Not Available",
            recommendation_score=min(1.0, score),
            institute_type=str(row.get('Type of Course', 'Unknown'))
        )
        predictions.append(prediction)
    
    # Sort by recommendation score
    predictions.sort(key=lambda x: x.recommendation_score, reverse=True)
    
    processing_time = int((time.time() - start_time) * 1000)
    
    logger.info(f"🎯 Generated {len(predictions)} predictions in {processing_time}ms")
    
    return PredictionResponse(
        user_query=request,
        total_colleges_found=len(predictions),
        predictions=predictions[:50],  # Return top 50
        processing_time_ms=processing_time,
        filters_applied=filters_applied
    )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting NEET-PG College Finder Final Enhanced API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
