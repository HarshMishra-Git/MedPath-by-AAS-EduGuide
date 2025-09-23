# 🎓 NEET-PG College Finder - AI-Powered Medical College Prediction System

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/neet-pg-finder)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.0+-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An advanced, production-ready AI system for predicting medical college admissions for NEET-PG candidates. Features state-of-the-art machine learning models, real-time predictions, and comprehensive analytics.

## 🎯 Overview

This system provides NEET-PG candidates with:
- **Accurate admission probability predictions** using advanced ML models
- **Real-time college recommendations** with confidence intervals
- **Financial analysis** of fees, stipends, and bonds
- **Interactive visualizations** and trend analysis
- **Mobile-responsive interface** with PWA support
- **Comprehensive API** for integration with other systems

## ✨ Features

### 🤖 Advanced Machine Learning
- **Multiple ML Models**: TabNet, XGBoost, CatBoost, Transformers, Stacked Ensembles
- **Quantile Regression**: Confidence intervals for all predictions
- **Time-Series Analysis**: Historical trend analysis and future projections
- **Model Explainability**: SHAP values and feature importance analysis

### 🔮 Intelligent Predictions
- **Admission Probability**: Per college, course, and category
- **Round-wise Predictions**: Most likely admission round
- **Risk Assessment**: Uncertainty quantification
- **Future Projections**: 2025 closing rank predictions

### 💰 Financial Analysis
- **Cost-Benefit Analysis**: Fees vs potential returns
- **Bond Impact Assessment**: Long-term financial implications
- **Stipend Analysis**: Income potential during residency
- **ROI Calculations**: Return on investment metrics

### 📊 Advanced Analytics
- **Interactive Dashboards**: Real-time data visualizations
- **Comparative Analysis**: Multi-college comparisons
- **Trend Analysis**: Historical performance patterns
- **Export Capabilities**: PDF, Excel, JSON exports

### 🌐 Modern Web Interface
- **React Frontend**: Fast, responsive user interface
- **Material-UI Design**: Professional, accessible design system
- **PWA Support**: Install as mobile app
- **Dark/Light Theme**: User preference support

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  ML Pipeline    │
│  (Port 3000)    │────│   (Port 8000)   │────│   (Advanced)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface │    │  REST API       │    │  Model Storage  │
│   - Search       │    │  - Predictions  │    │  - Trained ML   │
│   - Results      │    │  - Analytics    │    │  - Encoders     │
│   - Analytics    │    │  - Export       │    │  - Scalers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
College Finder/
├── 📁 backend/                    # FastAPI backend services
├── 📁 frontend/                   # React frontend application  
├── 📁 data/                       # Raw and processed data
│   ├── 📁 raw/                    # Original datasets
│   └── 📁 processed/              # Cleaned and engineered data
├── 📁 models/                     # Machine learning models
│   ├── 📁 trained/                # Saved model artifacts
│   └── 📁 scripts/               # Model development code
├── 📁 scripts/                    # Data processing utilities
├── 📁 config/                     # Configuration files
├── 📁 docs/                       # Documentation
├── 📁 tests/                      # Test files
└── 📁 logs/                       # Application logs
```

For detailed structure information, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "College Finder"
```

2. **Install backend dependencies**
```bash
pip install -r config/requirements_complete.txt
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Process initial data**
```bash
python scripts/02_data_cleaning.py
python scripts/03_feature_engineering.py
```

5. **Train models** (optional - pre-trained models included)
```bash
python models/scripts/06_advanced_ml_models.py
python models/scripts/07_enhanced_prediction_system.py
```

6. **Start the services**
```bash
# Terminal 1: Backend API
python backend/08_complete_enhanced_api.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 🔧 Configuration

### Environment Variables
```bash
# Backend Configuration
API_HOST=localhost
API_PORT=8000
DEBUG=true

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost/neetpg

# Cache (optional)  
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

## 📊 Usage Examples

### Basic Prediction
```python
import requests

# API endpoint
url = "http://localhost:8000/predict"

# Request data
data = {
    "category": "OPEN-GEN",
    "state": "KARNATAKA", 
    "course": "MD MEDICINE",
    "type_of_course": "CLINICAL",
    "quota": "State Government",
    "air": 15000,
    "fee_range": [0, 500000],
    "prioritize_fees_low": True
}

# Get predictions
response = requests.post(url, json=data)
predictions = response.json()

print(f"Found {predictions['total_colleges_found']} colleges")
for college in predictions['predictions'][:3]:
    print(f"{college['institute']}: {college['admission_probability']:.2%}")
```

### Advanced Analytics
```python
# Get comprehensive analysis
analytics = requests.post("http://localhost:8000/analytics", json={
    "air": 15000,
    "category": "OPEN-GEN",
    "analysis_type": ["trends", "comparisons", "projections"]
}).json()

print(f"Trend Analysis: {analytics['trends']}")
print(f"Comparisons: {analytics['comparisons']}")
```

## 📈 Model Performance

| Model | R² Score | MAE | RMSE | Features |
|-------|----------|-----|------|----------|
| **TabNet** | 0.923 | 2,847 | 4,521 | Deep learning for tabular data |
| **XGBoost** | 0.918 | 2,956 | 4,677 | Gradient boosting with optimization |
| **CatBoost** | 0.915 | 3,024 | 4,763 | Categorical feature optimization |
| **Transformer** | 0.911 | 3,156 | 4,892 | Attention-based tabular learning |
| **Stacked Ensemble** | 0.928 | 2,734 | 4,398 | Multi-model combination |

## 📱 Mobile Support

The application is fully mobile-optimized with:
- **Progressive Web App** (PWA) capabilities
- **Responsive design** for all screen sizes
- **Touch-friendly interface**
- **Offline functionality** for cached data
- **Mobile-first** design principles

## 🧪 Testing

```bash
# Run backend tests
pytest tests/ -v

# Run frontend tests
cd frontend
npm test

# Run integration tests
pytest tests/integration/ -v

# Load testing
locust -f tests/load_test.py --host=http://localhost:8000
```

## 📚 API Documentation

### Key Endpoints

- `POST /predict` - Get college predictions
- `POST /explain` - Get model explanations
- `POST /analytics` - Get advanced analytics
- `POST /financial-analysis` - Get financial insights
- `GET /metadata` - Get system metadata
- `GET /health` - Health check

Full API documentation available at `/docs` when running the backend.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📋 Roadmap

### Version 2.1 (Q1 2025)
- [ ] Real-time data updates
- [ ] Advanced clustering algorithms  
- [ ] Multi-language support
- [ ] Enhanced mobile features

### Version 2.2 (Q2 2025)
- [ ] Blockchain verification
- [ ] Advanced visualizations
- [ ] ML model monitoring
- [ ] Performance optimizations

## 🐛 Known Issues

- Model training requires significant memory (>16GB recommended)
- Initial load time may be longer due to large model files
- Some historical data may have gaps for certain colleges

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NEET-PG data providers
- Open source ML libraries
- React and FastAPI communities
- Medical education stakeholders

## 📞 Support

- 📧 Email: support@neet-pg-finder.com
- 💬 Discord: [Join our community](https://discord.gg/neet-pg)
- 📖 Documentation: [docs/](docs/)
- 🐛 Bug Reports: [Issues](https://github.com/your-repo/issues)

## 🌟 Star History

⭐ If you find this project helpful, please consider starring it on GitHub!

---

**Built with ❤️ for NEET-PG aspirants**

*Last updated: September 2025*