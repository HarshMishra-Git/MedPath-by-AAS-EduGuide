from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import pandas as pd
import os
import re
from pathlib import Path
import uvicorn
from enum import Enum
import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import tempfile

app = FastAPI(
    title="Advanced NEET College Finder",
    description="Comprehensive college finder for NEET UG and PG admissions with expert counselor-level recommendations",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models
class ExamType(str, Enum):
    NEET_UG = "NEET-UG"
    NEET_PG = "NEET-PG"

class QuotaPreference(str, Enum):
    ALL_INDIA = "All India"
    STATE_WISE = "State Wise"

class CollegeRecommendation(BaseModel):
    institute: str
    course: str
    state: str
    quota: str
    category: str
    fee: str
    stipend: Optional[str] = None
    beds: Union[str, int, None] = None
    bond_years: Union[str, int, None] = None
    bond_penalty: Optional[str] = None
    closing_ranks: Dict[str, Any]
    safety_level: str  # Very Safe, Safe, Moderate, Good Chance, Possible
    recommendation_score: float
    details: Dict[str, Any]
    # Additional formatted details for display
    formatted_fee: Optional[str] = None
    formatted_stipend: Optional[str] = None
    formatted_bond_info: Optional[str] = None
    college_type: Optional[str] = None  # Government/Private/Deemed

class SearchRequest(BaseModel):
    exam_type: ExamType
    preference: QuotaPreference
    state: Optional[str] = None
    quota: Optional[str] = None
    category: str
    course: str
    rank_min: int = Field(ge=1, le=1250000, description="Student's AIR rank (or minimum rank if range)")
    rank_max: int = Field(ge=1, le=1250000, description="Student's AIR rank (or maximum rank if range)")

class FilterOptions(BaseModel):
    quotas: List[str] = []
    states: List[str] = []
    categories: List[str] = []
    courses: List[str] = []

# Global data storage
neet_data = {
    "ug_all_india": None,
    "ug_state_wise": None,
    "pg_all_india": None,
    "pg_state_wise": None
}

class NEETCollegeFinder:
    def __init__(self):
        self.data_path = Path("D:/DESKTOP-L/College Finder/data/raw")
        self.load_data()
    
    def load_data(self):
        """Load all NEET data files"""
        try:
            # Load NEET UG data - use comma separator and handle encoding
            neet_data["ug_all_india"] = pd.read_csv(
                self.data_path / "NEET_UG_all_india.csv", 
                encoding='utf-8-sig'
            )
            neet_data["ug_state_wise"] = pd.read_csv(
                self.data_path / "NEET_UG_statewise.csv", 
                encoding='utf-8-sig'
            )
            
            # Load NEET PG data
            neet_data["pg_all_india"] = pd.read_csv(
                self.data_path / "NEET_PG_all_india.csv", 
                encoding='utf-8-sig'
            )
            neet_data["pg_state_wise"] = pd.read_csv(
                self.data_path / "NEET_PG_statewise.csv", 
                encoding='utf-8-sig'
            )
            
            # Clean column names to remove any BOM or extra spaces
            for key, df in neet_data.items():
                if df is not None:
                    # Strip BOM and whitespace from column names
                    df.columns = df.columns.str.replace('\ufeff', '').str.strip()
                    # Replace any None/NaN values in important columns
                    df.fillna('-', inplace=True)
            
            print("All NEET data loaded successfully!")
            self.print_data_summary()
            
        except Exception as e:
            print(f"Error loading data: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")
    
    def print_data_summary(self):
        """Print summary of loaded data"""
        for key, df in neet_data.items():
            if df is not None:
                print(f"{key}: {len(df)} records, Columns: {list(df.columns)}")
    
    def get_quota_options(self, exam_type: ExamType, preference: QuotaPreference, state: Optional[str] = None) -> List[str]:
        """Get available quota options based on exam type and preference"""
        try:
            if exam_type == ExamType.NEET_UG:
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["ug_all_india"]
                    quota_col = 'QUOTA'
                else:  # State wise
                    df = neet_data["ug_state_wise"]
                    quota_col = 'QUOTA'
                    if state:
                        df = df[df['STATE'] == state]
            
            else:  # NEET PG
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["pg_all_india"]
                    quota_col = 'QUOTA'
                else:  # State wise
                    df = neet_data["pg_state_wise"]
                    quota_col = 'Quota'  # Different column naming in PG state-wise
                    if state:
                        state_col = 'State'  # Different column naming in PG state-wise
                        df = df[df[state_col] == state]
            
            # Get unique quota options, filtering out empty/null values
            quota_options = df[quota_col].dropna().unique().tolist()
            quota_options = [q for q in quota_options if str(q).strip() and str(q) != '-' and str(q) != 'nan']
            return sorted(quota_options)
        
        except Exception as e:
            print(f"Error getting quota options: {e}")
            return []
    
    def get_state_options(self, exam_type: ExamType) -> List[str]:
        """Get available state options"""
        try:
            if exam_type == ExamType.NEET_UG:
                # Get states from state wise data only (All India doesn't need state selection)
                # Check if 'STATE' column exists
                df_sw = neet_data["ug_state_wise"]
                if 'STATE' in df_sw.columns:
                    states = df_sw['STATE'].unique().tolist()
                else:
                    # Handle case where column might have different name
                    state_cols = [col for col in df_sw.columns if 'state' in col.lower()]
                    if state_cols:
                        states = df_sw[state_cols[0]].unique().tolist()
                    else:
                        print(f"Warning: No STATE column found in UG state-wise data. Available columns: {list(df_sw.columns)}")
                        states = []
            else:  # NEET PG
                # Similar logic for PG data
                df_sw = neet_data["pg_state_wise"]
                if 'State' in df_sw.columns:
                    states = df_sw['State'].unique().tolist()
                elif 'STATE' in df_sw.columns:
                    states = df_sw['STATE'].unique().tolist()
                else:
                    state_cols = [col for col in df_sw.columns if 'state' in col.lower()]
                    if state_cols:
                        states = df_sw[state_cols[0]].unique().tolist()
                    else:
                        print(f"Warning: No State column found in PG state-wise data. Available columns: {list(df_sw.columns)}")
                        states = []
            
            return sorted([state for state in states if pd.notna(state) and str(state).strip()])
        
        except Exception as e:
            print(f"Error getting state options: {e}")
            return []
    
    def get_category_options(self, exam_type: ExamType, preference: QuotaPreference, 
                           state: Optional[str] = None, quota: Optional[str] = None) -> List[str]:
        """Get available category options based on selections"""
        try:
            if exam_type == ExamType.NEET_UG:
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["ug_all_india"]
                    if quota:
                        df = df[df['QUOTA'] == quota]
                    category_col = 'CATEGORY'
                else:
                    df = neet_data["ug_state_wise"]
                    if state:
                        df = df[df['STATE'] == state]
                    if quota:
                        df = df[df['QUOTA'] == quota]
                    category_col = 'CATEGORY'
            
            else:  # NEET PG
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["pg_all_india"]
                    if quota:
                        df = df[df['QUOTA'] == quota]
                    category_col = 'CATEGORY'
                else:
                    df = neet_data["pg_state_wise"]
                    if state:
                        df = df[df['State'] == state]
                    if quota:
                        df = df[df['Quota'] == quota]
                    category_col = 'Category'  # Different column naming in PG state-wise
            
            # Get unique category options, filtering out empty/null values
            category_options = df[category_col].dropna().unique().tolist()
            category_options = [c for c in category_options if str(c).strip() and str(c) != '-' and str(c) != 'nan']
            return sorted(category_options)
        
        except Exception as e:
            print(f"Error getting category options: {e}")
            return []
    
    def get_course_options(self, exam_type: ExamType, preference: QuotaPreference,
                          state: Optional[str] = None, quota: Optional[str] = None,
                          category: Optional[str] = None) -> List[str]:
        """Get available course options based on selections"""
        try:
            if exam_type == ExamType.NEET_UG:
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["ug_all_india"]
                    quota_col = 'QUOTA'
                    category_col = 'CATEGORY'
                    course_col = 'COURSE'
                else:
                    df = neet_data["ug_state_wise"]
                    if state:
                        df = df[df['STATE'] == state]
                    quota_col = 'QUOTA'
                    category_col = 'CATEGORY'
                    course_col = 'COURSE'
                
                if quota:
                    df = df[df[quota_col] == quota]
                if category:
                    df = df[df[category_col] == category]
                
                course_options = df[course_col].dropna().unique().tolist()
                course_options = [c for c in course_options if str(c).strip() and str(c) != '-' and str(c) != 'nan']
                return sorted(course_options)
            
            else:  # NEET PG
                if preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["pg_all_india"]
                    quota_col = 'QUOTA'
                    category_col = 'CATEGORY'
                    course_col = 'COURSE'
                else:
                    df = neet_data["pg_state_wise"]
                    if state:
                        df = df[df['State'] == state]
                    quota_col = 'Quota'  # Different column naming in PG state-wise
                    category_col = 'Category'  # Different column naming in PG state-wise
                    course_col = 'Course'  # Different column naming in PG state-wise
                
                if quota:
                    df = df[df[quota_col] == quota]
                if category:
                    df = df[df[category_col] == category]
                
                course_options = df[course_col].dropna().unique().tolist()
                course_options = [c for c in course_options if str(c).strip() and str(c) != '-' and str(c) != 'nan']
                return sorted(course_options)
        
        except Exception as e:
            print(f"Error getting course options: {e}")
            return []
    
    def extract_closing_ranks(self, row: pd.Series) -> Dict[str, Any]:
        """Extract closing rank data from a row"""
        closing_ranks = {}
        
        # Get all columns that start with 'CR' (Closing Rank)
        cr_columns = [col for col in row.index if str(col).startswith('CR')]
        
        for col in cr_columns:
            value = row[col]
            if pd.notna(value) and str(value).strip() != '-' and str(value).strip():
                try:
                    # Clean and validate rank value
                    rank_str = str(value).replace(',', '').strip()
                    
                    # Skip non-numeric values like "Info Not Available"
                    if rank_str.lower() in ['info not available', 'n/a', 'na', 'not available', '-']:
                        continue
                        
                    if rank_str.isdigit():
                        rank_int = int(rank_str)
                        # Only include valid rank ranges (1 to 1,500,000)
                        if 1 <= rank_int <= 1500000:
                            closing_ranks[col] = rank_int
                except Exception as e:
                    # Skip invalid values silently
                    continue
        
        return closing_ranks
    
    def calculate_admission_possibility(self, closing_ranks: Dict[str, Any], user_rank: int) -> tuple:
        """Calculate if admission is POSSIBLE based on round-wise closing ranks analysis"""
        if not closing_ranks:
            return False, "No Data", 0.0
        
        # Extract numeric ranks from all rounds
        numeric_ranks = []
        round_ranks = {}  # Store round-wise data
        
        for col, rank in closing_ranks.items():
            if isinstance(rank, int) and rank > 0:
                numeric_ranks.append(rank)
                # Identify round information
                if 'CR' in str(col):
                    round_ranks[col] = rank
            elif isinstance(rank, str) and rank.isdigit():
                rank_int = int(rank)
                numeric_ranks.append(rank_int)
                round_ranks[col] = rank_int
        
        if not numeric_ranks:
            return False, "No Data", 0.0
        
        # Find the BEST closing rank across ALL rounds (lowest number = easiest to get)
        best_closing_rank = min(numeric_ranks)  # This is the easiest rank that got admission historically
        worst_closing_rank = max(numeric_ranks)  # This is the hardest rank that got admission
        
        # CORE LOGIC: Can user get admission in ANY round?
        # If user's rank is better than the WORST closing rank in history,
        # they have a chance in at least one round
        
        admission_possible = user_rank <= worst_closing_rank * 1.05  # 5% buffer for rank fluctuations
        
        if not admission_possible:
            return False, "Not Possible", 0.0
        
        # If admission is possible, calculate safety level and confidence
        if user_rank <= best_closing_rank * 0.8:  # Much better than best historical rank
            safety_level = "Very Safe"
            score = 0.95
            
        elif user_rank <= best_closing_rank:  # Better than best closing rank
            safety_level = "Safe"
            score = 0.85
            
        elif user_rank <= best_closing_rank * 1.2:  # Within 20% of best rank
            safety_level = "Moderate"
            score = 0.70
            
        elif user_rank <= worst_closing_rank * 0.9:  # Better than 90% of worst rank
            safety_level = "Good Chance"
            score = 0.55
            
        else:  # Within worst closing rank range
            safety_level = "Possible"
            score = 0.35
        
        # Boost score for recent favorable trends
        recent_ranks = [r for col, r in round_ranks.items() if ('2024' in col or '2025' in col)]
        if recent_ranks:
            recent_best = min(recent_ranks)
            if user_rank <= recent_best:  # User can get in based on recent data
                score = min(1.0, score + 0.15)
        
        return True, safety_level, round(score, 3)
    
    def get_rank_position_text(self, user_rank: int, closing_ranks: Dict[str, Any]) -> str:
        """Generate text explaining user's rank position relative to historical data"""
        numeric_ranks = [r for r in closing_ranks.values() if isinstance(r, int)]
        if not numeric_ranks:
            return "No historical rank data available"
        
        min_rank = min(numeric_ranks)
        max_rank = max(numeric_ranks)
        avg_rank = sum(numeric_ranks) / len(numeric_ranks)
        
        if user_rank <= min_rank:
            return f"Your rank ({user_rank:,}) is better than the best historical cutoff ({min_rank:,})"
        elif user_rank <= avg_rank:
            return f"Your rank ({user_rank:,}) is better than the average cutoff ({avg_rank:,.0f})"
        elif user_rank <= max_rank:
            return f"Your rank ({user_rank:,}) is within the historical range (worst cutoff: {max_rank:,})"
        else:
            return f"Your rank ({user_rank:,}) is above the historical range (worst cutoff: {max_rank:,})"
    
    def format_fee(self, fee_str: str) -> str:
        """Format fee string for display"""
        if not fee_str or fee_str in ['N/A', '-', '0', 'nan']:
            return 'Not Available'
        
        # Clean and format fee
        fee_clean = str(fee_str).replace('₹', '').replace(',', '').strip()
        if fee_clean.isdigit():
            fee_num = int(fee_clean)
            if fee_num == 0:
                return 'Free'
            elif fee_num < 10000:
                return f'₹ {fee_num:,}'
            else:
                return f'₹ {fee_num:,} per year'
        return str(fee_str)
    
    def format_stipend(self, stipend_str: str) -> str:
        """Format stipend string for display"""
        if not stipend_str or stipend_str in ['N/A', '-', '0', 'nan']:
            return 'Not Available'
        
        stipend_clean = str(stipend_str).replace('₹', '').replace(',', '').strip()
        if stipend_clean.isdigit():
            stipend_num = int(stipend_clean)
            if stipend_num == 0:
                return 'No Stipend'
            else:
                return f'₹ {stipend_num:,} per month'
        return str(stipend_str)
    
    def format_bond_info(self, bond_years: Union[str, int, None], bond_penalty: str) -> str:
        """Format bond information for display"""
        if not bond_years or str(bond_years).lower() in ['n/a', '-', '0', 'info not available', 'not available']:
            return 'No Bond'
        
        try:
            bond_num = int(float(str(bond_years)))
            if bond_num <= 0:
                return 'No Bond'
            bond_text = f"{bond_num} year{'s' if bond_num > 1 else ''}"
            if bond_penalty and str(bond_penalty).lower() not in ['₹ 0', 'n/a', '-', 'info not available']:
                bond_text += f" (Penalty: {bond_penalty})"
            return bond_text
        except (ValueError, TypeError):
            return 'Bond Info Available'
    
    def determine_college_type(self, institute: str, quota: str) -> str:
        """Determine college type based on institute name and quota"""
        institute_lower = institute.lower()
        quota_lower = quota.lower()
        
        if 'aiims' in institute_lower or 'government' in institute_lower:
            return 'Government'
        elif 'deemed' in quota_lower or 'private' in institute_lower:
            return 'Deemed/Private'
        elif 'medical college' in institute_lower and 'government' not in institute_lower:
            return 'Private'
        else:
            return 'Government'
    
    def safe_convert_beds(self, beds_value) -> Union[int, str]:
        """Safely convert beds value to integer or return string"""
        if not beds_value or pd.isna(beds_value):
            return 'N/A'
        
        beds_str = str(beds_value).strip()
        if beds_str.lower() in ['n/a', '-', 'info not available', 'not available']:
            return 'N/A'
        
        try:
            beds_num = int(float(beds_str))
            return beds_num if beds_num > 0 else 'N/A'
        except (ValueError, TypeError):
            return beds_str  # Return original string if can't convert
    
    def generate_pdf_report(self, recommendations: List[CollegeRecommendation], 
                          search_criteria: dict, user_rank: int) -> str:
        """Generate beautiful PDF report of college recommendations"""
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf', prefix='NEET_Colleges_')
        temp_filename = temp_file.name
        temp_file.close()
        
        # Create PDF document
        doc = SimpleDocTemplate(temp_filename, pagesize=A4, 
                              rightMargin=72, leftMargin=72, 
                              topMargin=72, bottomMargin=18)
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'],
                                   fontSize=20, spaceAfter=30, textColor=colors.darkblue,
                                   alignment=TA_CENTER)
        heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'],
                                     fontSize=14, spaceAfter=12, textColor=colors.darkgreen)
        normal_style = styles['Normal']
        
        # Build PDF content
        story = []
        
        # Title
        title = Paragraph("🎯 NEET College Recommendations Report", title_style)
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Student Information
        student_info = f"""
        <b>Student Details:</b><br/>
        AIR Rank: <b>{user_rank:,}</b><br/>
        Exam Type: <b>{search_criteria.get('exam_type', 'N/A')}</b><br/>
        Preference: <b>{search_criteria.get('preference', 'N/A')}</b><br/>
        Category: <b>{search_criteria.get('category', 'N/A')}</b><br/>
        Course: <b>{search_criteria.get('course', 'N/A')}</b><br/>
        Generated on: <b>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</b>
        """
        story.append(Paragraph(student_info, normal_style))
        story.append(Spacer(1, 20))
        
        # Summary Statistics
        summary_stats = self.calculate_summary_stats(recommendations)
        summary_text = f"""
        <b>📊 Summary Statistics:</b><br/>
        Total Colleges Found: <b>{len(recommendations)}</b><br/>
        Very Safe Options: <b>{summary_stats['very_safe']}</b><br/>
        Safe Options: <b>{summary_stats['safe']}</b><br/>
        Moderate Options: <b>{summary_stats['moderate']}</b><br/>
        Good Chance Options: <b>{summary_stats['good_chance']}</b><br/>
        Possible Options: <b>{summary_stats['possible']}</b>
        """
        story.append(Paragraph(summary_text, normal_style))
        story.append(Spacer(1, 25))
        
        # College Details Table
        story.append(Paragraph("🏥 Detailed College Information", heading_style))
        
        # Create table data
        table_data = [[
            'College Name', 'State', 'Safety Level', 'Fee (Annual)', 
            'Stipend (Monthly)', 'Bond Years', 'Admission Probability'
        ]]
        
        for college in recommendations:
            table_data.append([
                college.institute[:40] + '...' if len(college.institute) > 40 else college.institute,
                college.state,
                college.safety_level,
                college.formatted_fee or self.format_fee(college.fee),
                college.formatted_stipend or self.format_stipend(college.stipend),
                college.formatted_bond_info or self.format_bond_info(college.bond_years, college.bond_penalty),
                f"{int(college.recommendation_score * 100)}%"
            ])
        
        # Create table
        table = Table(table_data, colWidths=[2.2*inch, 0.8*inch, 1*inch, 1*inch, 1*inch, 0.8*inch, 0.8*inch])
        
        # Style the table
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        # Add alternating row colors
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                table.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), colors.lightgrey)]))
        
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Important Notes
        notes_text = """
        <b>📝 Important Notes:</b><br/>
        • This report shows only colleges where admission is POSSIBLE based on historical data<br/>
        • Safety levels are based on 3+ years of closing rank analysis<br/>
        • Apply to a mix of Very Safe, Safe, and Moderate colleges for best results<br/>
        • Fees and stipends may vary - verify with official college websites<br/>
        • Bond requirements are subject to change - check current policies<br/>
        • Generated by Advanced NEET College Finder - Your AI Counselor
        """
        story.append(Paragraph(notes_text, normal_style))
        
        # Build PDF
        doc.build(story)
        
        return temp_filename
    
    def calculate_summary_stats(self, recommendations: List[CollegeRecommendation]) -> dict:
        """Calculate summary statistics for recommendations"""
        return {
            'very_safe': len([r for r in recommendations if r.safety_level == "Very Safe"]),
            'safe': len([r for r in recommendations if r.safety_level == "Safe"]),
            'moderate': len([r for r in recommendations if r.safety_level == "Moderate"]),
            'good_chance': len([r for r in recommendations if r.safety_level == "Good Chance"]),
            'possible': len([r for r in recommendations if r.safety_level == "Possible"])
        }
    
    def search_colleges(self, request: SearchRequest) -> List[CollegeRecommendation]:
        """Search for colleges based on user criteria"""
        try:
            # Select appropriate dataset
            if request.exam_type == ExamType.NEET_UG:
                if request.preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["ug_all_india"].copy()
                else:
                    df = neet_data["ug_state_wise"].copy()
            else:  # NEET PG
                if request.preference == QuotaPreference.ALL_INDIA:
                    df = neet_data["pg_all_india"].copy()
                else:
                    df = neet_data["pg_state_wise"].copy()
            
            # Apply filters
            if request.state:
                state_col = 'STATE' if 'STATE' in df.columns else 'State'
                df = df[df[state_col] == request.state]
            
            if request.quota:
                quota_col = 'QUOTA' if 'QUOTA' in df.columns else 'Quota'
                df = df[df[quota_col] == request.quota]
            
            # Handle category column naming differences
            category_col = 'CATEGORY' if 'CATEGORY' in df.columns else 'Category'
            course_col = 'COURSE' if 'COURSE' in df.columns else 'Course'
            
            df = df[df[category_col] == request.category]
            df = df[df[course_col] == request.course]
            
            if df.empty:
                return []
            
            # Process each college
            recommendations = []
            # Use single AIR rank (when rank_min == rank_max, just use one of them)
            user_rank = request.rank_min if request.rank_min == request.rank_max else int((request.rank_min + request.rank_max) / 2)
            
            for _, row in df.iterrows():
                closing_ranks = self.extract_closing_ranks(row)
                admission_possible, safety_level, score = self.calculate_admission_possibility(closing_ranks, user_rank)
                
                # ONLY SHOW COLLEGES WHERE ADMISSION IS ACTUALLY POSSIBLE!
                if admission_possible:  # This filters out impossible colleges
                    # Extract comprehensive college details
                    institute = str(row.get('INSTITUTE', 'N/A')).strip('"')
                    course = str(row.get('COURSE', row.get('Course', 'N/A')))
                    state = str(row.get('STATE', row.get('State', 'N/A')))
                    quota = str(row.get('QUOTA', row.get('Quota', 'N/A')))
                    category = str(row.get('CATEGORY', row.get('Category', 'N/A')))
                    
                    # Extract and format financial details
                    fee_raw = str(row.get('FEE', row.get('Fee', '0')))
                    stipend_raw = str(row.get('STIPEND YEAR 1', row.get('Stipend Year 1', row.get('STIPEND', 'N/A'))))
                    
                    # Safe bed count extraction
                    beds_raw = row.get('BEDS', row.get('Beds', 'N/A'))
                    beds = self.safe_convert_beds(beds_raw)
                    
                    bond_years_raw = row.get('BOND YEARS', row.get('Bond Years', 0))
                    bond_penalty_raw = str(row.get('BOND PENALTY', row.get('Bond Penalty', '₹ 0')))
                    
                    # Format details for display
                    formatted_fee = self.format_fee(fee_raw)
                    formatted_stipend = self.format_stipend(stipend_raw)
                    formatted_bond_info = self.format_bond_info(bond_years_raw, bond_penalty_raw)
                    college_type = self.determine_college_type(institute, quota)
                    
                    recommendation = CollegeRecommendation(
                        institute=institute,
                        course=course,
                        state=state,
                        quota=quota,
                        category=category,
                        fee=fee_raw,
                        stipend=stipend_raw,
                        beds=beds,
                        bond_years=bond_years_raw,
                        bond_penalty=bond_penalty_raw,
                        closing_ranks=closing_ranks,
                        safety_level=safety_level,
                        recommendation_score=score,
                        formatted_fee=formatted_fee,
                        formatted_stipend=formatted_stipend,
                        formatted_bond_info=formatted_bond_info,
                        college_type=college_type,
                        details={
                            "rank_analysis": {
                                "user_rank": user_rank,
                                "min_closing_rank": min([r for r in closing_ranks.values() if isinstance(r, int)], default=0),
                                "max_closing_rank": max([r for r in closing_ranks.values() if isinstance(r, int)], default=0),
                                "avg_closing_rank": sum([r for r in closing_ranks.values() if isinstance(r, int)]) / len([r for r in closing_ranks.values() if isinstance(r, int)]) if closing_ranks else 0,
                                "rank_position": self.get_rank_position_text(user_rank, closing_ranks)
                            },
                            "admission_probability": score,
                            "recommendation": self.get_recommendation_text(safety_level, score),
                            "financial_info": {
                                "total_fee": formatted_fee,
                                "monthly_stipend": formatted_stipend,
                                "bond_requirement": formatted_bond_info,
                                "college_type": college_type
                            }
                        }
                    )
                    
                    recommendations.append(recommendation)
            
            # Sort by recommendation score (descending)
            recommendations.sort(key=lambda x: x.recommendation_score, reverse=True)
            
            return recommendations
        
        except Exception as e:
            print(f"Error searching colleges: {e}")
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
    
    def get_recommendation_text(self, safety_level: str, score: float) -> str:
        """Generate recommendation text based on safety level for AIR rank predictions"""
        confidence_pct = int(score * 100)
        
        if safety_level == "Very Safe":
            return f"Excellent choice! Your AIR rank gives you a {confidence_pct}% chance of admission. This college should definitely be on your list."
        elif safety_level == "Safe":
            return f"Great option! With your AIR rank, you have a {confidence_pct}% probability of getting admission based on historical cutoffs."
        elif safety_level == "Moderate":
            return f"Good choice to consider. Your rank gives you a {confidence_pct}% chance. Apply early in counseling rounds for better chances."
        elif safety_level == "Good Chance":
            return f"Solid option with {confidence_pct}% probability. Your rank is competitive for this college based on historical data."
        elif safety_level == "Possible":
            return f"Worth applying with {confidence_pct}% chance. Your rank is within the admission range, typically filled in later rounds."
        else:
            return "Insufficient historical data available for reliable prediction with your AIR rank."

# Initialize the college finder
college_finder = NEETCollegeFinder()

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Advanced NEET College Finder API",
        "version": "2.0.0",
        "description": "AI-powered NEET college finder with expert counselor recommendations and PDF export",
        "endpoints": {
            "/states": "Get available states",
            "/quotas": "Get available quotas",
            "/categories": "Get available categories",  
            "/courses": "Get available courses",
            "/search": "Search for colleges (JSON response)",
            "/export-pdf": "Export college recommendations as beautiful PDF report",
            "/health": "API health check"
        },
        "features": [
            "Only shows colleges where admission is ACTUALLY possible",
            "Round-wise closing rank analysis",
            "Complete college details (fees, stipend, bond)",
            "Beautiful PDF export functionality",
            "Expert counselor-level recommendations"
        ]
    }

@app.get("/states")
async def get_states(exam_type: ExamType):
    """Get available states for given exam type"""
    try:
        states = college_finder.get_state_options(exam_type)
        return {"states": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quotas")
async def get_quotas(exam_type: ExamType, preference: QuotaPreference, state: Optional[str] = None):
    """Get available quotas based on exam type and preference"""
    try:
        quotas = college_finder.get_quota_options(exam_type, preference, state)
        return {"quotas": quotas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories")
async def get_categories(exam_type: ExamType, preference: QuotaPreference, 
                        state: Optional[str] = None, quota: Optional[str] = None):
    """Get available categories based on selections"""
    try:
        categories = college_finder.get_category_options(exam_type, preference, state, quota)
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses")
async def get_courses(exam_type: ExamType, preference: QuotaPreference,
                     state: Optional[str] = None, quota: Optional[str] = None,
                     category: Optional[str] = None):
    """Get available courses based on selections"""
    try:
        courses = college_finder.get_course_options(exam_type, preference, state, quota, category)
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_colleges(request: SearchRequest):
    """Search for colleges based on user criteria"""
    try:
        # Validate rank range
        if request.rank_min > request.rank_max:
            raise HTTPException(status_code=400, detail="Minimum rank cannot be greater than maximum rank")
        
        # Validate rank limits based on exam type
        max_rank_limit = 1250000 if request.exam_type == ExamType.NEET_UG else 200000
        if request.rank_max > max_rank_limit:
            raise HTTPException(
                status_code=400, 
                detail=f"Rank range exceeds limit for {request.exam_type.value} (max: {max_rank_limit})"
            )
        
        recommendations = college_finder.search_colleges(request)
        
        return {
            "total_results": len(recommendations),
            "search_criteria": request.dict(),
            "recommendations": recommendations,
            "summary": {
                "very_safe": len([r for r in recommendations if r.safety_level == "Very Safe"]),
                "safe": len([r for r in recommendations if r.safety_level == "Safe"]),
                "moderate": len([r for r in recommendations if r.safety_level == "Moderate"]),
                "good_chance": len([r for r in recommendations if r.safety_level == "Good Chance"]),
                "possible": len([r for r in recommendations if r.safety_level == "Possible"])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-pdf")
async def export_colleges_pdf(request: SearchRequest):
    """Export college recommendations as a beautiful PDF report"""
    try:
        # Validate rank range
        if request.rank_min > request.rank_max:
            raise HTTPException(status_code=400, detail="Minimum rank cannot be greater than maximum rank")
        
        # Validate rank limits based on exam type
        max_rank_limit = 1250000 if request.exam_type == ExamType.NEET_UG else 200000
        if request.rank_max > max_rank_limit:
            raise HTTPException(
                status_code=400, 
                detail=f"Rank range exceeds limit for {request.exam_type.value} (max: {max_rank_limit})"
            )
        
        # Get college recommendations
        recommendations = college_finder.search_colleges(request)
        
        if not recommendations:
            raise HTTPException(status_code=404, detail="No colleges found matching your criteria")
        
        # Generate PDF report
        user_rank = request.rank_min if request.rank_min == request.rank_max else int((request.rank_min + request.rank_max) / 2)
        search_criteria = request.dict()
        
        pdf_file_path = college_finder.generate_pdf_report(recommendations, search_criteria, user_rank)
        
        # Generate filename with student details
        filename = f"NEET_Colleges_Rank_{user_rank}_{request.exam_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return FileResponse(
            path=pdf_file_path,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    data_status = {}
    for key, df in neet_data.items():
        data_status[key] = {
            "loaded": df is not None,
            "records": len(df) if df is not None else 0
        }
    
    return {
        "status": "healthy",
        "data_status": data_status
    }

if __name__ == "__main__":
    print("Starting Advanced NEET College Finder API...")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)