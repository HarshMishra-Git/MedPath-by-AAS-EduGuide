#!/usr/bin/env python3
"""
Production Enhancement Suite
============================
Redis caching, rate limiting, user authentication, PostgreSQL integration, monitoring
"""

import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from datetime import datetime, timedelta
import bcrypt
import logging
from typing import Dict, List, Any, Optional, Tuple
import json
import asyncio
import aioredis
import asyncpg
from contextlib import asynccontextmanager
import hashlib
import time
from functools import wraps
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class RedisCache:
    """Redis caching layer for improved performance"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379", 
                 default_ttl: int = 3600):
        self.redis_url = redis_url
        self.default_ttl = default_ttl
        self.redis_client = None
        
    async def connect(self):
        """Initialize Redis connection"""
        self.redis_client = await aioredis.from_url(self.redis_url)
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        key_parts = [prefix]
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}:{v}")
        return ":".join(key_parts)
    
    async def get_prediction_cache(self, candidate_data: Dict[str, Any], 
                                 colleges: List[str]) -> Optional[Dict[str, Any]]:
        """Get cached prediction results"""
        cache_key = self._generate_key(
            "prediction",
            air=candidate_data.get('air', 0),
            category=candidate_data.get('category', ''),
            colleges_hash=hashlib.md5(str(sorted(colleges)).encode()).hexdigest()
        )
        
        cached_data = await self.redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        return None
    
    async def set_prediction_cache(self, candidate_data: Dict[str, Any], 
                                 colleges: List[str], results: Dict[str, Any], 
                                 ttl: int = None) -> None:
        """Cache prediction results"""
        cache_key = self._generate_key(
            "prediction",
            air=candidate_data.get('air', 0),
            category=candidate_data.get('category', ''),
            colleges_hash=hashlib.md5(str(sorted(colleges)).encode()).hexdigest()
        )
        
        await self.redis_client.setex(
            cache_key, 
            ttl or self.default_ttl,
            json.dumps(results)
        )
    
    async def get_college_rankings(self, filters: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Get cached college rankings"""
        cache_key = self._generate_key("rankings", **filters)
        cached_data = await self.redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        return None
    
    async def set_college_rankings(self, filters: Dict[str, Any], 
                                 rankings: List[Dict[str, Any]], 
                                 ttl: int = None) -> None:
        """Cache college rankings"""
        cache_key = self._generate_key("rankings", **filters)
        await self.redis_client.setex(
            cache_key,
            ttl or self.default_ttl,
            json.dumps(rankings)
        )
    
    async def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate cache keys matching pattern"""
        keys = await self.redis_client.keys(pattern)
        if keys:
            await self.redis_client.delete(*keys)

class RateLimiter:
    """Advanced rate limiting with Redis backend"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def is_rate_limited(self, identifier: str, limit: int = 100, 
                            window: int = 3600) -> Tuple[bool, Dict[str, Any]]:
        """Check if request should be rate limited"""
        key = f"rate_limit:{identifier}"
        current_time = int(time.time())
        window_start = current_time - window
        
        # Remove expired entries
        await self.redis.zremrangebyscore(key, 0, window_start)
        
        # Count current requests
        current_requests = await self.redis.zcard(key)
        
        if current_requests >= limit:
            # Get reset time
            oldest_request = await self.redis.zrange(key, 0, 0, withscores=True)
            reset_time = int(oldest_request[0][1]) + window if oldest_request else current_time + window
            
            return True, {
                'limited': True,
                'current_requests': current_requests,
                'limit': limit,
                'reset_time': reset_time,
                'window': window
            }
        
        # Add current request
        await self.redis.zadd(key, {str(current_time): current_time})
        await self.redis.expire(key, window)
        
        return False, {
            'limited': False,
            'current_requests': current_requests + 1,
            'limit': limit,
            'remaining': limit - current_requests - 1,
            'window': window
        }

class UserAuthentication:
    """JWT-based user authentication system"""
    
    def __init__(self, secret_key: str, redis_client=None):
        self.secret_key = secret_key
        self.redis = redis_client
        self.algorithm = "HS256"
        self.access_token_expire = timedelta(hours=24)
        self.refresh_token_expire = timedelta(days=30)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + self.access_token_expire
        payload = {
            **user_data,
            "exp": expire,
            "type": "access"
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + self.refresh_token_expire
        payload = {
            "user_id": user_id,
            "exp": expire,
            "type": "refresh"
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def revoke_token(self, token: str) -> None:
        """Add token to blacklist"""
        if self.redis:
            payload = self.decode_token(token)
            if payload:
                exp_time = payload.get('exp', 0)
                current_time = int(time.time())
                ttl = max(0, exp_time - current_time)
                
                await self.redis.setex(f"blacklist:{token}", ttl, "1")
    
    async def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        if self.redis:
            result = await self.redis.get(f"blacklist:{token}")
            return result is not None
        return False

class DatabaseManager:
    """PostgreSQL database connection and operations"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.pool = None
    
    async def init_pool(self):
        """Initialize connection pool"""
        self.pool = await asyncpg.create_pool(self.database_url, min_size=5, max_size=20)
    
    async def close_pool(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
    
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection from pool"""
        async with self.pool.acquire() as connection:
            yield connection
    
    async def init_tables(self):
        """Initialize database tables"""
        async with self.get_connection() as conn:
            # Users table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    category VARCHAR(10),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            """)
            
            # User sessions table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    refresh_token VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            """)
            
            # Prediction history table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    candidate_data JSONB,
                    predictions JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # User preferences table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    preferred_states TEXT[],
                    preferred_specializations TEXT[],
                    budget_range JSONB,
                    notification_preferences JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
    
    async def create_user(self, email: str, password_hash: str, name: str, 
                         phone: str = None, category: str = 'GENERAL') -> int:
        """Create new user"""
        async with self.get_connection() as conn:
            user_id = await conn.fetchval("""
                INSERT INTO users (email, password_hash, name, phone, category)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            """, email, password_hash, name, phone, category)
            return user_id
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        async with self.get_connection() as conn:
            user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
            return dict(user) if user else None
    
    async def save_prediction_history(self, user_id: int, candidate_data: Dict[str, Any], 
                                    predictions: Dict[str, Any]) -> None:
        """Save prediction to history"""
        async with self.get_connection() as conn:
            await conn.execute("""
                INSERT INTO prediction_history (user_id, candidate_data, predictions)
                VALUES ($1, $2, $3)
            """, user_id, json.dumps(candidate_data), json.dumps(predictions))
    
    async def get_user_prediction_history(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's prediction history"""
        async with self.get_connection() as conn:
            rows = await conn.fetch("""
                SELECT * FROM prediction_history 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT $2
            """, user_id, limit)
            return [dict(row) for row in rows]

class NotificationService:
    """Email and SMS notification service"""
    
    def __init__(self, smtp_config: Dict[str, str]):
        self.smtp_config = smtp_config
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   is_html: bool = False) -> bool:
        """Send email notification"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config['username']
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'html' if is_html else 'plain'))
            
            with smtplib.SMTP(self.smtp_config['smtp_server'], 
                            self.smtp_config['smtp_port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
            
            return True
        except Exception as e:
            logging.error(f"Email sending failed: {str(e)}")
            return False
    
    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new user"""
        subject = "Welcome to NEET-PG College Finder!"
        body = f"""
        <html>
        <body>
            <h2>Welcome {user_name}!</h2>
            <p>Thank you for joining NEET-PG College Finder. We're excited to help you find the perfect medical college for your postgraduate studies.</p>
            
            <h3>What you can do with our platform:</h3>
            <ul>
                <li>Get AI-powered college recommendations based on your NEET-PG rank</li>
                <li>Analyze admission probabilities for different colleges and specializations</li>
                <li>Explore financial analysis including ROI and loan options</li>
                <li>Track your application progress and deadlines</li>
            </ul>
            
            <p>Get started by logging in and entering your NEET-PG details!</p>
            
            <p>Best regards,<br>NEET-PG College Finder Team</p>
        </body>
        </html>
        """
        return self.send_email(user_email, subject, body, is_html=True)

class HealthMonitor:
    """System health monitoring and alerting"""
    
    def __init__(self, redis_client=None, db_pool=None):
        self.redis = redis_client
        self.db_pool = db_pool
        self.health_checks = []
        
    async def check_redis_health(self) -> Dict[str, Any]:
        """Check Redis connectivity and performance"""
        try:
            start_time = time.time()
            await self.redis.ping()
            response_time = time.time() - start_time
            
            # Get Redis info
            info = await self.redis.info()
            memory_usage = info.get('used_memory', 0)
            connected_clients = info.get('connected_clients', 0)
            
            return {
                'service': 'Redis',
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'memory_usage_bytes': memory_usage,
                'connected_clients': connected_clients
            }
        except Exception as e:
            return {
                'service': 'Redis',
                'status': 'unhealthy',
                'error': str(e)
            }
    
    async def check_database_health(self) -> Dict[str, Any]:
        """Check PostgreSQL connectivity and performance"""
        try:
            start_time = time.time()
            async with self.db_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            response_time = time.time() - start_time
            
            # Get pool statistics
            pool_size = self.db_pool.get_size()
            pool_min_size = self.db_pool.get_min_size()
            pool_max_size = self.db_pool.get_max_size()
            
            return {
                'service': 'PostgreSQL',
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'pool_size': pool_size,
                'pool_min_size': pool_min_size,
                'pool_max_size': pool_max_size
            }
        except Exception as e:
            return {
                'service': 'PostgreSQL',
                'status': 'unhealthy',
                'error': str(e)
            }
    
    async def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health status"""
        health_status = {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': 'healthy',
            'services': []
        }
        
        # Check Redis
        if self.redis:
            redis_health = await self.check_redis_health()
            health_status['services'].append(redis_health)
            if redis_health['status'] != 'healthy':
                health_status['overall_status'] = 'degraded'
        
        # Check Database
        if self.db_pool:
            db_health = await self.check_database_health()
            health_status['services'].append(db_health)
            if db_health['status'] != 'healthy':
                health_status['overall_status'] = 'unhealthy'
        
        return health_status

class ProductionConfig:
    """Configuration management for production environment"""
    
    def __init__(self):
        self.redis_url = "redis://localhost:6379"
        self.database_url = "postgresql://user:password@localhost/neet_pg"
        self.secret_key = "your-super-secret-key-change-in-production"
        self.smtp_config = {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'your-email@gmail.com',
            'password': 'your-app-password'
        }
        
        # Rate limiting configuration
        self.rate_limits = {
            'prediction': {'limit': 10, 'window': 60},  # 10 predictions per minute
            'search': {'limit': 100, 'window': 3600},   # 100 searches per hour
            'auth': {'limit': 5, 'window': 300}         # 5 auth attempts per 5 minutes
        }
        
        # Cache TTL configuration
        self.cache_ttls = {
            'predictions': 1800,    # 30 minutes
            'rankings': 3600,       # 1 hour
            'college_data': 86400   # 24 hours
        }

# Decorator for rate limiting
def rate_limit(limit_type: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # This would be implemented in the FastAPI application
            # For now, just pass through
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage example and initialization
async def initialize_production_services():
    """Initialize all production services"""
    config = ProductionConfig()
    
    # Initialize Redis cache
    cache = RedisCache(config.redis_url)
    await cache.connect()
    
    # Initialize database
    db_manager = DatabaseManager(config.database_url)
    await db_manager.init_pool()
    await db_manager.init_tables()
    
    # Initialize authentication
    auth = UserAuthentication(config.secret_key, cache.redis_client)
    
    # Initialize rate limiter
    rate_limiter = RateLimiter(cache.redis_client)
    
    # Initialize notification service
    notification_service = NotificationService(config.smtp_config)
    
    # Initialize health monitor
    health_monitor = HealthMonitor(cache.redis_client, db_manager.pool)
    
    return {
        'cache': cache,
        'database': db_manager,
        'auth': auth,
        'rate_limiter': rate_limiter,
        'notifications': notification_service,
        'health_monitor': health_monitor,
        'config': config
    }

if __name__ == "__main__":
    async def test_services():
        services = await initialize_production_services()
        
        # Test health check
        health = await services['health_monitor'].get_system_health()
        print("System Health:", json.dumps(health, indent=2))
        
        # Cleanup
        await services['cache'].disconnect()
        await services['database'].close_pool()
    
    asyncio.run(test_services())