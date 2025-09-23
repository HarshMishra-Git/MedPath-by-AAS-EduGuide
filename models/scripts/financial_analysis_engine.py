#!/usr/bin/env python3
"""
NEET-PG Financial Analysis Engine
================================
Comprehensive financial analysis with ROI, cost-benefit analysis, and scholarship opportunities
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json

class FinancialAnalysisEngine:
    """Advanced financial analysis for medical education decisions"""
    
    def __init__(self):
        self.salary_data = self._initialize_salary_data()
        self.loan_schemes = self._initialize_loan_schemes()
        self.scholarship_data = self._initialize_scholarships()
    
    def _initialize_salary_data(self) -> Dict[str, Dict[str, float]]:
        """Initialize expected salary data by specialization and sector"""
        return {
            'ANAESTHESIOLOGY': {'govt': 120000, 'private': 180000, 'abroad': 400000},
            'RADIOLOGY': {'govt': 130000, 'private': 250000, 'abroad': 450000},
            'DERMATOLOGY': {'govt': 100000, 'private': 300000, 'abroad': 350000},
            'GENERAL_MEDICINE': {'govt': 90000, 'private': 150000, 'abroad': 300000},
            'GENERAL_SURGERY': {'govt': 110000, 'private': 200000, 'abroad': 380000},
            'DEFAULT': {'govt': 95000, 'private': 160000, 'abroad': 320000}
        }
    
    def _initialize_loan_schemes(self) -> List[Dict[str, Any]]:
        """Initialize education loan schemes"""
        return [
            {
                'scheme_name': 'SBI Education Loan',
                'max_amount': 1500000,
                'interest_rate': 10.5,
                'tenure_years': 15,
                'processing_fee': 10000,
                'eligibility': 'All categories'
            },
            {
                'scheme_name': 'HDFC Credila',
                'max_amount': 2000000,
                'interest_rate': 11.0,
                'tenure_years': 15,
                'processing_fee': 15000,
                'eligibility': 'All categories'
            },
            {
                'scheme_name': 'Government Subsidy Scheme',
                'max_amount': 1000000,
                'interest_rate': 4.0,
                'tenure_years': 10,
                'processing_fee': 0,
                'eligibility': 'SC/ST/OBC below income limit'
            }
        ]
    
    def _initialize_scholarships(self) -> List[Dict[str, Any]]:
        """Initialize scholarship opportunities"""
        return [
            {
                'name': 'Central Sector Scholarship',
                'amount': 20000,
                'eligibility': 'Merit-based, all categories',
                'duration_years': 3,
                'total_value': 60000
            },
            {
                'name': 'SC/ST Post-Matric Scholarship',
                'amount': 30000,
                'eligibility': 'SC/ST categories',
                'duration_years': 3,
                'total_value': 90000
            },
            {
                'name': 'Minority Scholarship',
                'amount': 25000,
                'eligibility': 'Minority communities',
                'duration_years': 3,
                'total_value': 75000
            }
        ]
    
    def analyze_financial_impact(self, college_data: Dict[str, Any], 
                                candidate_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive financial analysis for a college option"""
        
        # Extract basic financial data
        annual_fees = college_data.get('annual_fees', 0) or 0
        stipend_year1 = college_data.get('stipend_year1', 0) or 0
        bond_years = college_data.get('bond_years', 0) or 0
        bond_amount = college_data.get('bond_amount', 0) or 0
        course = college_data.get('course', 'DEFAULT')
        institute_type = college_data.get('institute_type', 'Unknown')
        
        # Calculate total program costs
        total_costs = self._calculate_total_costs(annual_fees, bond_years, bond_amount)
        
        # Calculate effective costs after stipends
        effective_costs = self._calculate_effective_costs(total_costs, stipend_year1)
        
        # ROI analysis
        roi_analysis = self._calculate_roi(effective_costs, course, institute_type)
        
        # Loan analysis
        loan_analysis = self._analyze_loan_requirements(effective_costs['net_program_cost'], 
                                                      candidate_profile)
        
        # Scholarship opportunities
        scholarship_analysis = self._analyze_scholarships(candidate_profile)
        
        # Payback period analysis
        payback_analysis = self._calculate_payback_period(effective_costs, roi_analysis, course)
        
        # Risk assessment
        risk_assessment = self._assess_financial_risk(college_data, effective_costs, 
                                                    candidate_profile)
        
        return {
            'total_costs': total_costs,
            'effective_costs': effective_costs,
            'roi_analysis': roi_analysis,
            'loan_analysis': loan_analysis,
            'scholarship_opportunities': scholarship_analysis,
            'payback_analysis': payback_analysis,
            'risk_assessment': risk_assessment,
            'recommendations': self._generate_financial_recommendations(
                total_costs, effective_costs, roi_analysis, risk_assessment
            )
        }
    
    def _calculate_total_costs(self, annual_fees: float, bond_years: float, 
                             bond_amount: float) -> Dict[str, float]:
        """Calculate comprehensive program costs"""
        # Program duration (3 years for most PG courses)
        program_years = 3
        
        # Direct costs
        total_tuition = annual_fees * program_years
        hostel_costs = 30000 * program_years  # Estimated
        books_equipment = 50000  # One-time
        exam_fees = 15000  # Total
        miscellaneous = 25000 * program_years
        
        # Indirect costs
        living_expenses = 60000 * program_years
        transport = 10000 * program_years
        
        # Bond liability (present value)
        bond_liability = bond_amount if bond_years > 0 else 0
        
        total_direct = total_tuition + hostel_costs + books_equipment + exam_fees + miscellaneous
        total_indirect = living_expenses + transport
        total_program_cost = total_direct + total_indirect + bond_liability
        
        return {
            'total_tuition_fees': float(total_tuition),
            'hostel_and_accommodation': float(hostel_costs),
            'books_and_equipment': float(books_equipment),
            'exam_fees': float(exam_fees),
            'miscellaneous_expenses': float(miscellaneous),
            'living_expenses': float(living_expenses),
            'transport_costs': float(transport),
            'bond_liability': float(bond_liability),
            'total_direct_costs': float(total_direct),
            'total_indirect_costs': float(total_indirect),
            'total_program_cost': float(total_program_cost)
        }
    
    def _calculate_effective_costs(self, total_costs: Dict[str, float], 
                                 stipend_year1: float) -> Dict[str, float]:
        """Calculate net costs after stipends and benefits"""
        # Estimate stipend progression (usually increases)
        year1_stipend = stipend_year1
        year2_stipend = stipend_year1 * 1.1  # 10% increase
        year3_stipend = stipend_year1 * 1.2  # 20% increase
        
        total_stipends = year1_stipend + year2_stipend + year3_stipend
        
        # Net costs
        net_program_cost = total_costs['total_program_cost'] - total_stipends
        net_direct_cost = total_costs['total_direct_costs'] - total_stipends
        
        # Effective monthly cost during program
        monthly_cost_during_program = net_program_cost / 36  # 3 years = 36 months
        
        return {
            'total_stipends_received': float(total_stipends),
            'net_program_cost': float(max(0, net_program_cost)),
            'net_direct_costs': float(max(0, net_direct_cost)),
            'monthly_cost_during_program': float(monthly_cost_during_program),
            'stipend_coverage_ratio': float(total_stipends / total_costs['total_program_cost'])
        }
    
    def _calculate_roi(self, effective_costs: Dict[str, float], course: str, 
                      institute_type: str) -> Dict[str, float]:
        """Calculate return on investment analysis"""
        net_investment = effective_costs['net_program_cost']
        
        # Get expected salaries
        course_key = course.upper().replace(' ', '_')
        salary_data = self.salary_data.get(course_key, self.salary_data['DEFAULT'])
        
        # Adjust salary based on institute type
        if institute_type.lower() == 'government':
            expected_salary = salary_data['govt']
        elif institute_type.lower() == 'private':
            expected_salary = salary_data['private'] * 0.9  # Slightly lower for private college grads
        else:
            expected_salary = salary_data['govt'] * 1.1  # Average
        
        # Calculate annual returns
        annual_salary = expected_salary * 12
        
        # Career progression (salary growth over time)
        career_30_years_value = self._calculate_career_value(annual_salary, 30)
        career_20_years_value = self._calculate_career_value(annual_salary, 20)
        
        # ROI calculations
        simple_roi = (career_20_years_value - net_investment) / net_investment * 100
        annual_roi = ((career_20_years_value / net_investment) ** (1/20) - 1) * 100
        
        # Payback period
        payback_years = net_investment / annual_salary if annual_salary > 0 else float('inf')
        
        return {
            'net_investment': float(net_investment),
            'expected_starting_salary_monthly': float(expected_salary),
            'expected_annual_salary': float(annual_salary),
            '20_year_career_value': float(career_20_years_value),
            '30_year_career_value': float(career_30_years_value),
            'simple_roi_20_years': float(simple_roi),
            'annual_roi_percentage': float(annual_roi),
            'payback_period_years': float(min(payback_years, 99))
        }
    
    def _calculate_career_value(self, starting_salary: float, years: int) -> float:
        """Calculate total career value with salary growth"""
        total_value = 0
        current_salary = starting_salary
        growth_rate = 0.08  # 8% annual growth
        
        for year in range(years):
            total_value += current_salary
            current_salary *= (1 + growth_rate)
        
        return total_value
    
    def _analyze_loan_requirements(self, net_cost: float, 
                                 candidate_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze loan requirements and options"""
        if net_cost <= 0:
            return {
                'loan_required': False,
                'message': 'No loan required - stipends cover all costs'
            }
        
        category = candidate_profile.get('category', 'GENERAL')
        family_income = candidate_profile.get('family_income', 500000)  # Default estimate
        
        # Loan requirement analysis
        loan_schemes = []
        for scheme in self.loan_schemes:
            if net_cost <= scheme['max_amount']:
                # Calculate EMI
                monthly_rate = scheme['interest_rate'] / 100 / 12
                tenure_months = scheme['tenure_years'] * 12
                
                if monthly_rate > 0:
                    emi = (net_cost * monthly_rate * (1 + monthly_rate)**tenure_months) / \
                          ((1 + monthly_rate)**tenure_months - 1)
                else:
                    emi = net_cost / tenure_months
                
                # Check eligibility
                eligible = True
                if 'SC/ST/OBC' in scheme['eligibility'] and category not in ['SC', 'ST', 'OBC']:
                    eligible = False
                
                loan_schemes.append({
                    'scheme_name': scheme['scheme_name'],
                    'loan_amount': float(net_cost),
                    'interest_rate': scheme['interest_rate'],
                    'tenure_years': scheme['tenure_years'],
                    'monthly_emi': float(emi),
                    'total_repayment': float(emi * tenure_months),
                    'total_interest': float(emi * tenure_months - net_cost),
                    'processing_fee': scheme['processing_fee'],
                    'eligible': eligible
                })
        
        # Sort by total repayment amount
        loan_schemes.sort(key=lambda x: x['total_repayment'])
        
        return {
            'loan_required': True,
            'required_amount': float(net_cost),
            'available_schemes': loan_schemes,
            'recommended_scheme': loan_schemes[0] if loan_schemes else None,
            'loan_to_income_ratio': float(net_cost / family_income) if family_income > 0 else 0
        }
    
    def _analyze_scholarships(self, candidate_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze available scholarship opportunities"""
        category = candidate_profile.get('category', 'GENERAL')
        air = candidate_profile.get('air', 50000)
        
        eligible_scholarships = []
        total_scholarship_value = 0
        
        for scholarship in self.scholarship_data:
            eligible = False
            
            # Check eligibility
            if 'all categories' in scholarship['eligibility'].lower():
                eligible = True
            elif 'SC/ST' in scholarship['eligibility'] and category in ['SC', 'ST']:
                eligible = True
            elif 'minority' in scholarship['eligibility'].lower():
                eligible = True  # Assume eligible for demo
            elif 'merit' in scholarship['eligibility'].lower() and air <= 25000:
                eligible = True
            
            if eligible:
                eligible_scholarships.append(scholarship)
                total_scholarship_value += scholarship['total_value']
        
        return {
            'eligible_scholarships': eligible_scholarships,
            'total_scholarship_value': float(total_scholarship_value),
            'application_required': len(eligible_scholarships) > 0,
            'estimated_annual_support': float(total_scholarship_value / 3) if eligible_scholarships else 0
        }
    
    def _calculate_payback_period(self, effective_costs: Dict[str, float], 
                                roi_analysis: Dict[str, float], course: str) -> Dict[str, Any]:
        """Calculate detailed payback period analysis"""
        net_investment = effective_costs['net_program_cost']
        annual_salary = roi_analysis['expected_annual_salary']
        
        if annual_salary <= 0:
            return {'error': 'Unable to calculate payback period'}
        
        # Conservative estimate (after taxes and expenses)
        monthly_savings = annual_salary * 0.3 / 12  # 30% savings rate
        
        payback_months = net_investment / monthly_savings if monthly_savings > 0 else float('inf')
        payback_years = payback_months / 12
        
        # Break-even analysis
        break_even_scenarios = [
            {
                'scenario': 'Conservative (20% savings)',
                'monthly_savings': annual_salary * 0.2 / 12,
                'payback_years': net_investment / (annual_salary * 0.2) if annual_salary > 0 else float('inf')
            },
            {
                'scenario': 'Moderate (30% savings)',
                'monthly_savings': annual_salary * 0.3 / 12,
                'payback_years': net_investment / (annual_salary * 0.3) if annual_salary > 0 else float('inf')
            },
            {
                'scenario': 'Aggressive (40% savings)',
                'monthly_savings': annual_salary * 0.4 / 12,
                'payback_years': net_investment / (annual_salary * 0.4) if annual_salary > 0 else float('inf')
            }
        ]
        
        return {
            'primary_payback_period_years': float(min(payback_years, 99)),
            'break_even_scenarios': break_even_scenarios,
            'monthly_salary_after_graduation': float(roi_analysis['expected_starting_salary_monthly']),
            'estimated_monthly_savings': float(monthly_savings)
        }
    
    def _assess_financial_risk(self, college_data: Dict[str, Any], 
                             effective_costs: Dict[str, float],
                             candidate_profile: Dict[str, Any]) -> Dict[str, str]:
        """Assess financial risk factors"""
        risks = []
        risk_level = 'Low'
        
        # High fees risk
        if effective_costs['net_program_cost'] > 1000000:
            risks.append('High program costs - significant financial commitment required')
            risk_level = 'High'
        elif effective_costs['net_program_cost'] > 500000:
            risks.append('Moderate program costs - careful financial planning needed')
            risk_level = 'Medium'
        
        # Bond risk
        bond_amount = college_data.get('bond_amount', 0)
        bond_years = college_data.get('bond_years', 0)
        if bond_amount > 2000000:
            risks.append('High bond penalty - limits career flexibility')
            risk_level = 'High'
        elif bond_years > 3:
            risks.append('Long bond period - extended service commitment')
            if risk_level == 'Low':
                risk_level = 'Medium'
        
        # Institute type risk
        institute_type = college_data.get('institute_type', 'Unknown')
        if institute_type == 'Private':
            risks.append('Private institute - higher fees but potential for better facilities')
        
        # Stipend coverage
        coverage_ratio = effective_costs.get('stipend_coverage_ratio', 0)
        if coverage_ratio < 0.3:
            risks.append('Low stipend coverage - significant out-of-pocket expenses')
            if risk_level == 'Low':
                risk_level = 'Medium'
        
        return {
            'risk_level': risk_level,
            'risk_factors': risks,
            'mitigation_strategies': self._generate_risk_mitigation(risks)
        }
    
    def _generate_risk_mitigation(self, risks: List[str]) -> List[str]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        if any('High program costs' in risk for risk in risks):
            strategies.append('Consider education loans with favorable terms')
            strategies.append('Apply for all eligible scholarships')
            strategies.append('Explore part-time work opportunities during residency')
        
        if any('bond' in risk.lower() for risk in risks):
            strategies.append('Evaluate bond terms carefully - consider long-term career plans')
            strategies.append('Compare with non-bond alternatives')
        
        if any('Low stipend' in risk for risk in risks):
            strategies.append('Budget carefully and track expenses')
            strategies.append('Look for additional income sources like tutoring')
        
        return strategies
    
    def _generate_financial_recommendations(self, total_costs: Dict[str, float],
                                          effective_costs: Dict[str, float],
                                          roi_analysis: Dict[str, float],
                                          risk_assessment: Dict[str, str]) -> List[Dict[str, Any]]:
        """Generate financial recommendations"""
        recommendations = []
        
        # ROI-based recommendation
        roi = roi_analysis.get('annual_roi_percentage', 0)
        if roi > 15:
            recommendations.append({
                'type': 'positive',
                'title': 'Excellent Investment',
                'description': f'High ROI of {roi:.1f}% annually makes this a strong financial choice'
            })
        elif roi > 10:
            recommendations.append({
                'type': 'neutral',
                'title': 'Good Investment',
                'description': f'Solid ROI of {roi:.1f}% annually - comparable to market returns'
            })
        else:
            recommendations.append({
                'type': 'caution',
                'title': 'Consider Carefully',
                'description': f'Lower ROI of {roi:.1f}% - evaluate non-financial benefits'
            })
        
        # Payback period recommendation
        payback = roi_analysis.get('payback_period_years', 99)
        if payback < 5:
            recommendations.append({
                'type': 'positive',
                'title': 'Quick Payback',
                'description': f'Investment pays back in {payback:.1f} years - very reasonable'
            })
        elif payback < 10:
            recommendations.append({
                'type': 'neutral',
                'title': 'Moderate Payback',
                'description': f'Investment pays back in {payback:.1f} years - within acceptable range'
            })
        
        # Cost management
        net_cost = effective_costs.get('net_program_cost', 0)
        if net_cost > 750000:
            recommendations.append({
                'type': 'action',
                'title': 'Explore Financing Options',
                'description': 'High costs require careful financial planning and possibly education loans'
            })
        
        return recommendations

# Usage example
if __name__ == "__main__":
    engine = FinancialAnalysisEngine()
    
    test_college = {
        'annual_fees': 200000,
        'stipend_year1': 50000,
        'bond_years': 3,
        'bond_amount': 3000000,
        'course': 'ANAESTHESIOLOGY',
        'institute_type': 'Government'
    }
    
    test_candidate = {
        'category': 'GENERAL',
        'air': 25000,
        'family_income': 800000
    }
    
    result = engine.analyze_financial_impact(test_college, test_candidate)
    print(json.dumps(result, indent=2))