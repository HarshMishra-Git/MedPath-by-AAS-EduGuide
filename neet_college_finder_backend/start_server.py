#!/usr/bin/env python3
"""
Startup script for NEET College Finder API Server
"""

import sys
import os
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required!")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_data_files():
    """Check if required data files exist"""
    data_path = Path("../data/raw")
    required_files = [
        "NEET_UG_all_india.csv",
        "NEET_UG_statewise.csv", 
        "NEET_PG_all_india.csv",
        "NEET_PG_statewise.csv"
    ]
    
    missing_files = []
    for file_name in required_files:
        file_path = data_path / file_name
        if not file_path.exists():
            missing_files.append(str(file_path))
        else:
            file_size = file_path.stat().st_size
            print(f"✅ Found {file_name} ({file_size:,} bytes)")
    
    if missing_files:
        print("\n❌ Missing required data files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print("\nPlease ensure all NEET data files are in the data/raw directory.")
        sys.exit(1)

def check_requirements():
    """Check if required packages are available"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'pandas',
        'pydantic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"⚠️  Missing required packages: {', '.join(missing_packages)}")
        print("📦 Please install requirements manually:")
        print("   pip install -r requirements.txt")
        print("\nThen restart the server.")
        sys.exit(1)
    else:
        print("✅ All required packages are installed")

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting NEET College Finder API Server...")
    print("📍 API will be available at: http://localhost:8001")
    print("📖 API documentation: http://localhost:8001/docs")
    print("📊 Health check: http://localhost:8001/health")
    print("\n💡 Press Ctrl+C to stop the server\n")
    
    try:
        import uvicorn
        
        # Use string import path to avoid reload issues
        uvicorn.run(
            "main:app", 
            host="0.0.0.0", 
            port=8001, 
            reload=False,  # Disable reload to avoid import issues
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("\nTry running directly with:")
        print("uvicorn main:app --host 0.0.0.0 --port 8001")
        sys.exit(1)

def main():
    """Main startup function"""
    print("=" * 60)
    print("🏥 NEET College Finder API Server")
    print("=" * 60)
    
    # Pre-flight checks
    print("\n🔍 Running pre-flight checks...")
    check_python_version()
    check_data_files()
    check_requirements()
    
    print("\n✅ All checks passed!")
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()