#!/usr/bin/env python3
"""
🎓 NEET COLLEGE FINDER BACKEND - STARTUP SCRIPT 🎓
Simple ML-Powered College Recommendation System
"""

import sys
import os
import subprocess
from pathlib import Path
import asyncio

def display_simple_banner():
    """Display the simple banner"""
    banner = """
    ████████████████████████████████████████████████████████████████████████████████
    █                                                                              █
    █   🎓 NEET COLLEGE FINDER BACKEND - SIMPLE ML VERSION 🎓                   █
    █                                                                              █
    █   🎯 Core Features:                                                          █
    █   • Machine Learning College Predictions                                    █
    █   • Safety Level Analysis                                                   █
    █   • Smart Filtering & Sorting                                               █
    █   • Interactive Results Display                                             █
    █                                                                              █
    █   📊 Essential Data:                                                         █
    █   • NEET UG All India Data                                                  █
    █   • NEET UG State-wise Data                                                 █
    █   • NEET PG All India Data                                                  █
    █   • NEET PG State-wise Data                                                 █
    █                                                                              █
    █   🔗 Frontend Compatible | 🎯 ML-Powered | 🚀 Production Ready              █
    █                                                                              █
    ████████████████████████████████████████████████████████████████████████████████
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required for Ultimate Backend!")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_ultimate_requirements():
    """Check if all ultimate requirements are available"""
    required_packages = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn', 
        'pandas': 'pandas',
        'numpy': 'numpy',
        'pydantic': 'pydantic',
        'sklearn': 'scikit-learn'  # sklearn is the import name, scikit-learn is pip name
    }
    
    missing_packages = []
    available_packages = []
    
    for import_name, pip_name in required_packages.items():
        try:
            __import__(import_name)
            available_packages.append(pip_name)
            print(f"✅ {pip_name} - Available")
        except ImportError:
            missing_packages.append(pip_name)
            print(f"❌ {pip_name} - Missing")
    
    if missing_packages:
        print(f"\n⚠️  Missing ultimate packages: {', '.join(missing_packages)}")
        print("💡 Please install manually with:")
        print(f"   pip install {' '.join(missing_packages)}")
        print("   OR")
        print("   pip install -r requirements.txt")
        print("\n⏸️  Install the packages and restart the server.")
        sys.exit(1)
    else:
        print("✅ All ultimate packages are available")

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
            print(f"✅ {file_name} ({file_size:,} bytes)")
    
    if missing_files:
        print("\n❌ Missing required data files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print("\n🔍 Please ensure all NEET data files are in the data/raw directory.")
        sys.exit(1)
    
    print("✅ All data files are available for Ultimate Backend")

def check_port_availability():
    """Check if port 8002 is available"""
    import socket
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', 8002))
        print("✅ Port 8002 is available for Backend")
    except OSError:
        print("⚠️  Port 8002 is in use. Backend will try to start anyway.")

def start_simple_server():
    """Start the Simple NEET Backend Server"""
    print("\n🚀 Starting NEET College Finder Backend...")
    print("🎯 ML-powered college recommendations ready!")
    print("📍 API: http://localhost:8002")
    print("📖 Documentation: http://localhost:8002/docs")
    print("🏥 Health Check: http://localhost:8002/health")
    print("⚡ Compatible with frontend on port 3001")
    print("\n🎨 Core Features Available:")
    print("   • /search - ML-powered college search")
    print("   • /health - System health check")
    print("   • /states - Get states list")
    print("   • /categories - Get categories list")
    print("   • /courses - Get courses list")
    print("\n💡 Press Ctrl+C to stop the Backend\n")
    
    try:
        import uvicorn
        
        # Run the ultimate app using string import
        uvicorn.run(
            "main:app",  # Simple ML app
            host="0.0.0.0",
            port=8002,
            reload=False,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Backend stopped by user")
    except Exception as e:
        print(f"❌ Failed to start Backend: {e}")
        print("\nTry running directly with:")
        print("python main.py")
        sys.exit(1)

def main():
    """Main startup function for Simple Backend"""
    display_simple_banner()
    
    print("🔍 Running Backend pre-flight checks...\n")
    
    # Pre-flight checks
    check_python_version()
    check_ultimate_requirements()
    check_data_files()
    check_port_availability()
    
    print("\n🎉 All Backend checks passed!")
    print("🤖 ML Engine will initialize automatically")
    print("📊 Core features will be available within 10 seconds")
    
    # Start the Backend
    start_simple_server()

if __name__ == "__main__":
    main()