#!/usr/bin/env python3
"""
Deep inspection of key mismatches
"""
import pandas as pd

# Load original and ranks data
print("Loading datasets...")
original_df = pd.read_csv('Neet-PG.csv')
ranks_df = pd.read_csv('closing_ranks_long.csv')

print(f"Original shape: {original_df.shape}")
print(f"Ranks shape: {ranks_df.shape}")

print("\n=== ORIGINAL DATA SAMPLE ===")
sample_orig = original_df[['Institute', 'Course', 'State', 'Category', 'Quota']].head(10)
print(sample_orig)

print("\n=== RANKS DATA SAMPLE ===")
sample_ranks = ranks_df[['Institute', 'Course', 'State', 'Category', 'Quota']].head(10)
print(sample_ranks)

print("\n=== EXACT COMPARISON ===")
print("First original record:")
orig_first = original_df.iloc[0]
print(f"Institute: '{orig_first['Institute']}'")
print(f"Course: '{orig_first['Course']}'")
print(f"State: '{orig_first['State']}'")
print(f"Category: '{orig_first['Category']}'")
print(f"Quota: '{orig_first['Quota']}'")

print("\nFirst ranks record:")
ranks_first = ranks_df.iloc[0]
print(f"Institute: '{ranks_first['Institute']}'")
print(f"Course: '{ranks_first['Course']}'")
print(f"State: '{ranks_first['State']}'")
print(f"Category: '{ranks_first['Category']}'")
print(f"Quota: '{ranks_first['Quota']}'")

print("\n=== CHECKING FOR MATCHES ===")
# Try to find the first ranks record in original
print(f"Looking for ranks record in original data...")
match = original_df[
    (original_df['Institute'] == ranks_first['Institute']) &
    (original_df['Course'] == ranks_first['Course']) &
    (original_df['State'] == ranks_first['State']) &
    (original_df['Category'] == ranks_first['Category']) &
    (original_df['Quota'] == ranks_first['Quota'])
]

print(f"Matches found: {len(match)}")
if len(match) > 0:
    print("Match found!")
    print(match)
else:
    print("No exact match found. Checking individual components...")
    
    # Check each component
    print(f"Institute matches: {(original_df['Institute'] == ranks_first['Institute']).sum()}")
    print(f"Course matches: {(original_df['Course'] == ranks_first['Course']).sum()}")
    print(f"State matches: {(original_df['State'] == ranks_first['State']).sum()}")
    print(f"Category matches: {(original_df['Category'] == ranks_first['Category']).sum()}")
    print(f"Quota matches: {(original_df['Quota'] == ranks_first['Quota']).sum()}")
    
    # Check for case sensitivity issues
    print("\nChecking case-insensitive matches:")
    print(f"Institute matches (case-insensitive): {original_df['Institute'].str.upper().eq(ranks_first['Institute'].upper()).sum()}")
    print(f"State matches (case-insensitive): {original_df['State'].str.upper().eq(ranks_first['State'].upper()).sum()}")
    
# Show unique values for comparison
print(f"\n=== UNIQUE VALUES COMPARISON ===")
print(f"Original institutes (first 5): {original_df['Institute'].unique()[:5]}")
print(f"Ranks institutes (first 5): {ranks_df['Institute'].unique()[:5]}")

print(f"\nOriginal states (unique): {original_df['State'].unique()}")
print(f"Ranks states (first 5): {ranks_df['State'].unique()[:5]}")

print(f"\nOriginal categories (first 10): {original_df['Category'].unique()[:10]}")
print(f"Ranks categories (first 10): {ranks_df['Category'].unique()[:10]}")

print(f"\nOriginal quotas (first 10): {original_df['Quota'].unique()[:10]}")
print(f"Ranks quotas (first 10): {ranks_df['Quota'].unique()[:10]}")