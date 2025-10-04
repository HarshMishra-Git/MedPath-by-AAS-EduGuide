import React from 'react'
import { motion } from 'framer-motion'
import PaymentNotificationBanner from '../components/payment/PaymentNotificationBanner'
import {
  Brain, 
  Target, 
  TrendingUp, 
  Shield, 
  Users,
  Award,
  Zap,
  Database,
  Cpu,
  Network,
  BarChart3,
  CheckCircle,
  Star,
  GitBranch,
  Layers,
  Eye,
  Lock
} from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Payment Notification Banner */}
      <PaymentNotificationBanner />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Technology Stack */}
      <TechnologySection />
      
      {/* ML Models Section */}
      <MLModelsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Mission & Vision */}
      <MissionVisionSection />
    </div>
  )
}

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-medical-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              About <span className="text-gradient-primary">NEET ML</span>
              <br />
              <span className="text-gradient-neural">Predictor</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed text-justify">
              Revolutionary AI-powered platform that transforms NEET college admission predictions 
              using advanced machine learning algorithms and comprehensive data analysis.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="font-medium">95%+ Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Enterprise Grade Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Technology Stack Section
const TechnologySection = () => {
  const technologies = [
    {
      category: "Machine Learning",
      icon: Brain,
      gradient: "from-primary-500 to-medical-500",
      techs: [
        "TensorFlow & PyTorch",
        "Scikit-learn & XGBoost", 
        "Neural Networks (MLP, CNN)",
        "Ensemble Methods",
        "Feature Engineering",
        "Model Explainability (LIME, SHAP)"
      ]
    },
    {
      category: "Data & Analytics",
      icon: Database,
      gradient: "from-medical-500 to-success-500",
      techs: [
        "PostgreSQL & MongoDB",
        "Apache Kafka Streaming",
        "Data Preprocessing Pipelines",
        "Statistical Analysis",
        "Time Series Forecasting",
        "Real-time Data Processing"
      ]
    },
    {
      category: "Backend Infrastructure",
      icon: Cpu,
      gradient: "from-success-500 to-neural-500",
      techs: [
        "FastAPI & Python",
        "Docker & Kubernetes",
        "Redis Caching",
        "Microservices Architecture",
        "Load Balancing",
        "Auto-scaling Systems"
      ]
    },
    {
      category: "Frontend & UX",
      icon: Eye,
      gradient: "from-neural-500 to-primary-500",
      techs: [
        "React 18 & TypeScript",
        "Tailwind CSS & Framer Motion",
        "Advanced Visualizations",
        "Progressive Web App",
        "Responsive Design",
        "Accessibility Compliant"
      ]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Our <span className="text-gradient-primary">Technology Stack</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-justify">
            Built with cutting-edge technologies and industry best practices for reliability, 
            scalability, and performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => (
            <TechnologyCard key={tech.category} tech={tech} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

const TechnologyCard = ({ tech, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-premium p-8 hover-lift"
    >
      <div className={`w-16 h-16 bg-gradient-to-r ${tech.gradient} rounded-2xl flex items-center justify-center mb-6`}>
        <tech.icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
        {tech.category}
      </h3>
      <ul className="space-y-3">
        {tech.techs.map((item, i) => (
          <li key={i} className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
            <span className="text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// ML Models Section
const MLModelsSection = () => {
  const models = [
    {
      name: "Neural Network Ensemble",
      accuracy: "96.8%",
      description: "Multi-layer perceptron ensemble with dropout regularization and batch normalization for robust predictions.",
      features: ["Multi-target prediction", "Uncertainty quantification", "Feature importance analysis"]
    },
    {
      name: "Gradient Boosting Models",
      accuracy: "95.2%",
      description: "XGBoost and LightGBM models optimized for tabular data with advanced hyperparameter tuning.",
      features: ["Fast inference", "Missing value handling", "Categorical encoding"]
    },
    {
      name: "Random Forest Classifier",
      accuracy: "94.5%",
      description: "Ensemble of decision trees with feature bagging and bootstrap aggregating for stability.",
      features: ["Interpretable results", "Outlier resistance", "Feature selection"]
    },
    {
      name: "Expert Rule Engine",
      accuracy: "98.1%",
      description: "Domain knowledge integration with counselor insights and historical admission patterns.",
      features: ["Business logic integration", "Manual rule validation", "Expert knowledge capture"]
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-medical-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Advanced <span className="text-gradient-neural">ML Models</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-justify">
            Our ensemble approach combines multiple state-of-the-art models for maximum accuracy and reliability.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient p-8 border-l-4 border-primary-500"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-display font-bold text-gray-900">
                  {model.name}
                </h3>
                <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium">
                  {model.accuracy}
                </span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed text-justify">
                {model.description}
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {model.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: "Multi-Target Predictions",
      description: "Simultaneous prediction of admission probability, closing rank, safety level, and recommendation score."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analysis",
      description: "Dynamic predictions that adapt to current competition levels and admission trends."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "End-to-end encryption with GDPR compliance and zero data sharing policies."
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reports",
      description: "Detailed PDF reports with visualizations, insights, and actionable recommendations."
    },
    {
      icon: Network,
      title: "API Integration",
      description: "RESTful APIs for seamless integration with counseling platforms and educational tools."
    },
    {
      icon: Layers,
      title: "Model Explainability",
      description: "LIME and SHAP integration for transparent and interpretable AI decisions."
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Platform <span className="text-gradient-primary">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-justify">
            Comprehensive suite of features designed for students, counselors, and educational institutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-6 text-center hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-medical-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Team Section
const TeamSection = () => {
  const team = [
    {
      name: "Mr. Akhilesh Yadav",
      role: "Managing Director & Admission Counselor",
      image: "/api/placeholder/150/150",
      bio: "Visionary leader and founder of AAS EduGuide with 13+ years in medical education counseling. Expert in NEET admission strategies and career guidance."
    },
    {
      name: "Harsh Mishra",
      role: "AI Solutions Architect & Data Scientist",
      image: "/api/placeholder/150/150", 
      bio: "Lead architect behind MedPath's AI engine. Specializes in machine learning, data science, and building scalable AI solutions for educational technology."
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Meet Our <span className="text-gradient-primary">Expert Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            World-class team of data scientists, ML engineers, and medical education experts.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-12 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="card-premium p-8 text-center hover-lift max-w-sm w-full"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-success-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                {member.name}
              </h3>
              <p className="text-primary-600 font-semibold mb-4 text-sm uppercase tracking-wider">
                {member.role}
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Mission & Vision Section
const MissionVisionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-medical-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl font-display font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl leading-relaxed mb-6 text-blue-100">
              To democratize access to quality medical education by providing students with accurate, 
              data-driven insights that empower informed decision-making in their NEET journey.
            </p>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Eliminate uncertainty in college selection</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Reduce dependency on expensive counseling</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span>Increase success rates in medical admissions</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl font-display font-bold mb-6">
              Our Vision
            </h2>
            <p className="text-xl leading-relaxed mb-6 text-blue-100">
              To become the world's most trusted AI platform for medical education guidance, 
              setting the standard for accuracy, transparency, and student success.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <div className="text-blue-200">Students by 2025</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-blue-200">Accuracy Target</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-blue-200">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-200">AI Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutPage