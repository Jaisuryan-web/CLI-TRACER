from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenWeather API
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY')
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0"

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class GeoLocation(BaseModel):
    lat: float
    lon: float
    name: str
    country: str
    state: Optional[str] = None

class SearchHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city: str
    lat: float
    lon: float
    country: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper function for API calls
async def fetch_openweather(endpoint: str, params: dict):
    params["appid"] = OPENWEATHER_API_KEY
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.get(endpoint, params=params, timeout=15)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenWeather API error: {e}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Weather API error: {str(e)}")
        except httpx.RequestError as e:
            logger.error(f"Request error: {e}")
            raise HTTPException(status_code=503, detail="Weather service unavailable")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Weather API is running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Geocoding - Search city by name
@api_router.get("/weather/geocode")
async def geocode_city(q: str = Query(..., min_length=2, description="City name")):
    """Search for city coordinates by name"""
    data = await fetch_openweather(
        f"{OPENWEATHER_GEO_URL}/direct",
        {"q": q, "limit": 5}
    )
    if not data:
        raise HTTPException(status_code=404, detail="City not found")
    
    results = []
    for item in data:
        results.append({
            "name": item.get("name"),
            "lat": item.get("lat"),
            "lon": item.get("lon"),
            "country": item.get("country"),
            "state": item.get("state")
        })
    return results

# Reverse geocoding - Get city name from coordinates
@api_router.get("/weather/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    """Get city name from coordinates"""
    data = await fetch_openweather(
        f"{OPENWEATHER_GEO_URL}/reverse",
        {"lat": lat, "lon": lon, "limit": 1}
    )
    if not data:
        raise HTTPException(status_code=404, detail="Location not found")
    
    item = data[0]
    return {
        "name": item.get("name"),
        "lat": item.get("lat"),
        "lon": item.get("lon"),
        "country": item.get("country"),
        "state": item.get("state")
    }

# Current weather
@api_router.get("/weather/current")
async def get_current_weather(lat: float, lon: float, units: str = "metric"):
    """Get current weather for coordinates"""
    data = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/weather",
        {"lat": lat, "lon": lon, "units": units}
    )
    
    return {
        "temp": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "temp_min": data["main"]["temp_min"],
        "temp_max": data["main"]["temp_max"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "visibility": data.get("visibility", 0) / 1000,  # Convert to km
        "wind_speed": data["wind"]["speed"],
        "wind_deg": data["wind"].get("deg", 0),
        "wind_gust": data["wind"].get("gust"),
        "clouds": data["clouds"]["all"],
        "weather": {
            "id": data["weather"][0]["id"],
            "main": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        },
        "sunrise": data["sys"]["sunrise"],
        "sunset": data["sys"]["sunset"],
        "timezone": data["timezone"],
        "name": data["name"],
        "country": data["sys"]["country"],
        "dt": data["dt"]
    }

# 5-day forecast (3-hour intervals)
@api_router.get("/weather/forecast")
async def get_forecast(lat: float, lon: float, units: str = "metric"):
    """Get 5-day weather forecast"""
    data = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/forecast",
        {"lat": lat, "lon": lon, "units": units}
    )
    
    forecast_list = []
    for item in data["list"]:
        forecast_list.append({
            "dt": item["dt"],
            "temp": item["main"]["temp"],
            "feels_like": item["main"]["feels_like"],
            "temp_min": item["main"]["temp_min"],
            "temp_max": item["main"]["temp_max"],
            "humidity": item["main"]["humidity"],
            "pressure": item["main"]["pressure"],
            "wind_speed": item["wind"]["speed"],
            "wind_deg": item["wind"].get("deg", 0),
            "clouds": item["clouds"]["all"],
            "pop": item.get("pop", 0),  # Probability of precipitation
            "rain": item.get("rain", {}).get("3h", 0),
            "snow": item.get("snow", {}).get("3h", 0),
            "weather": {
                "id": item["weather"][0]["id"],
                "main": item["weather"][0]["main"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            }
        })
    
    # Group by day for daily forecast
    daily_forecast = {}
    for item in forecast_list:
        date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
        if date not in daily_forecast:
            daily_forecast[date] = {
                "date": date,
                "temps": [],
                "humidity": [],
                "weather_ids": [],
                "icons": [],
                "pop": []
            }
        daily_forecast[date]["temps"].append(item["temp"])
        daily_forecast[date]["humidity"].append(item["humidity"])
        daily_forecast[date]["weather_ids"].append(item["weather"]["id"])
        daily_forecast[date]["icons"].append(item["weather"]["icon"])
        daily_forecast[date]["pop"].append(item["pop"])
    
    # Calculate daily summaries
    daily_summary = []
    for date, values in daily_forecast.items():
        # Most common weather condition
        most_common_icon = max(set(values["icons"]), key=values["icons"].count)
        daily_summary.append({
            "date": date,
            "temp_min": min(values["temps"]),
            "temp_max": max(values["temps"]),
            "humidity_avg": sum(values["humidity"]) / len(values["humidity"]),
            "pop_max": max(values["pop"]),
            "icon": most_common_icon
        })
    
    return {
        "hourly": forecast_list[:24],  # Next 24 hours (8 x 3-hour intervals)
        "daily": daily_summary[:5]  # 5 days
    }

# Air Quality
@api_router.get("/weather/air-quality")
async def get_air_quality(lat: float, lon: float):
    """Get air quality index"""
    data = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/air_pollution",
        {"lat": lat, "lon": lon}
    )
    
    if not data.get("list"):
        raise HTTPException(status_code=404, detail="Air quality data not available")
    
    aqi_data = data["list"][0]
    components = aqi_data["components"]
    
    # AQI levels: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    aqi_labels = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}
    aqi = aqi_data["main"]["aqi"]
    
    return {
        "aqi": aqi,
        "aqi_label": aqi_labels.get(aqi, "Unknown"),
        "co": components.get("co"),  # Carbon monoxide
        "no": components.get("no"),  # Nitrogen monoxide
        "no2": components.get("no2"),  # Nitrogen dioxide
        "o3": components.get("o3"),  # Ozone
        "so2": components.get("so2"),  # Sulphur dioxide
        "pm2_5": components.get("pm2_5"),  # Fine particles
        "pm10": components.get("pm10"),  # Coarse particles
        "nh3": components.get("nh3"),  # Ammonia
        "dt": aqi_data["dt"]
    }

# UV Index (using One Call API 2.5 - we'll calculate from current data)
@api_router.get("/weather/uv-index")
async def get_uv_index(lat: float, lon: float):
    """Get UV index - estimated based on weather conditions"""
    # Get current weather to estimate UV
    current = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/weather",
        {"lat": lat, "lon": lon, "units": "metric"}
    )
    
    # Calculate approximate UV based on time of day, clouds, and location
    now = datetime.now(timezone.utc)
    hour = now.hour
    clouds = current["clouds"]["all"]
    lat_factor = abs(lat) / 90  # Higher latitudes = lower UV
    
    # Base UV calculation (simplified)
    if 6 <= hour <= 18:  # Daytime
        base_uv = 8 * (1 - lat_factor * 0.5)  # Max UV around equator
        # Adjust for time of day (peak at noon)
        time_factor = 1 - abs(12 - hour) / 6
        base_uv *= time_factor
        # Reduce by cloud cover
        cloud_factor = 1 - (clouds / 100) * 0.8
        uv = base_uv * cloud_factor
    else:
        uv = 0
    
    uv = max(0, min(11, round(uv, 1)))  # Cap between 0-11
    
    # UV risk levels
    if uv <= 2:
        risk = "Low"
        color = "green"
    elif uv <= 5:
        risk = "Moderate"
        color = "yellow"
    elif uv <= 7:
        risk = "High"
        color = "orange"
    elif uv <= 10:
        risk = "Very High"
        color = "red"
    else:
        risk = "Extreme"
        color = "purple"
    
    return {
        "uv": uv,
        "risk": risk,
        "color": color,
        "recommendation": get_uv_recommendation(uv)
    }

def get_uv_recommendation(uv: float) -> str:
    if uv <= 2:
        return "No protection needed. Safe to be outside."
    elif uv <= 5:
        return "Wear sunglasses and use SPF 30+ sunscreen."
    elif uv <= 7:
        return "Reduce time in the sun between 10am-4pm. Wear sunscreen, hat, and sunglasses."
    elif uv <= 10:
        return "Minimize sun exposure during midday hours. Shirt, sunscreen, and hat are a must."
    else:
        return "Avoid sun exposure. Stay indoors if possible."

# Weather Alerts (check for severe conditions)
@api_router.get("/weather/alerts")
async def get_weather_alerts(lat: float, lon: float, units: str = "metric"):
    """Check for weather alerts based on conditions"""
    current = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/weather",
        {"lat": lat, "lon": lon, "units": units}
    )
    
    forecast_data = await fetch_openweather(
        f"{OPENWEATHER_BASE_URL}/forecast",
        {"lat": lat, "lon": lon, "units": units}
    )
    
    alerts = []
    
    # Check current conditions for alerts
    weather_id = current["weather"][0]["id"]
    wind_speed = current["wind"]["speed"]
    temp = current["main"]["temp"]
    
    # Thunderstorm alerts (200-299)
    if 200 <= weather_id < 300:
        alerts.append({
            "type": "thunderstorm",
            "severity": "warning",
            "title": "Thunderstorm Warning",
            "description": "Thunderstorm activity in your area. Stay indoors and away from windows.",
            "icon": "cloud-lightning"
        })
    
    # Heavy rain (502, 503, 504)
    if weather_id in [502, 503, 504]:
        alerts.append({
            "type": "rain",
            "severity": "warning",
            "title": "Heavy Rain Alert",
            "description": "Heavy rainfall expected. Be cautious of flooding.",
            "icon": "cloud-rain"
        })
    
    # Snow alerts (600-699)
    if 600 <= weather_id < 700:
        alerts.append({
            "type": "snow",
            "severity": "advisory",
            "title": "Snow Advisory",
            "description": "Snow expected. Drive carefully and prepare for winter conditions.",
            "icon": "snowflake"
        })
    
    # High wind alert
    if wind_speed > 15:  # m/s
        alerts.append({
            "type": "wind",
            "severity": "warning",
            "title": "High Wind Warning",
            "description": f"Strong winds of {wind_speed} m/s. Secure loose objects.",
            "icon": "wind"
        })
    
    # Extreme heat
    if temp > 35:  # Celsius
        alerts.append({
            "type": "heat",
            "severity": "warning",
            "title": "Extreme Heat Warning",
            "description": f"Temperature of {temp}°C. Stay hydrated and avoid outdoor activities.",
            "icon": "thermometer"
        })
    
    # Extreme cold
    if temp < -10:
        alerts.append({
            "type": "cold",
            "severity": "warning",
            "title": "Extreme Cold Warning",
            "description": f"Temperature of {temp}°C. Dress warmly and limit outdoor exposure.",
            "icon": "thermometer-snowflake"
        })
    
    # Fog alert (700-799)
    if 700 <= weather_id < 800:
        alerts.append({
            "type": "fog",
            "severity": "advisory",
            "title": "Fog Advisory",
            "description": "Reduced visibility due to fog. Drive with caution.",
            "icon": "cloud-fog"
        })
    
    # Check forecast for upcoming severe weather
    for item in forecast_data["list"][:8]:  # Next 24 hours
        forecast_id = item["weather"][0]["id"]
        if 200 <= forecast_id < 300 and not any(a["type"] == "thunderstorm" for a in alerts):
            dt = datetime.fromtimestamp(item["dt"])
            alerts.append({
                "type": "thunderstorm_forecast",
                "severity": "watch",
                "title": "Thunderstorm Watch",
                "description": f"Thunderstorms possible around {dt.strftime('%I:%M %p')}.",
                "icon": "cloud-lightning"
            })
            break
    
    return {
        "alerts": alerts,
        "count": len(alerts),
        "has_warnings": any(a["severity"] == "warning" for a in alerts)
    }

# Search history
@api_router.post("/weather/history")
async def save_search_history(city: str, lat: float, lon: float, country: str):
    """Save search to history"""
    history = SearchHistory(city=city, lat=lat, lon=lon, country=country)
    doc = history.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.search_history.insert_one(doc)
    return {"message": "Saved to history"}

@api_router.get("/weather/history")
async def get_search_history(limit: int = 5):
    """Get recent search history"""
    history = await db.search_history.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    for item in history:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return history

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
