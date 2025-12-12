import requests
import sys
import json
from datetime import datetime

class WeatherAPITester:
    def __init__(self, base_url="https://stormtracker-9.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, params=None, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if params:
            print(f"   Params: {params}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'List with ' + str(len(response_data)) + ' items'}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "expected": expected_status,
                "actual": "Exception",
                "error": str(e)
            })
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test status endpoints
        self.run_test("Get Status Checks", "GET", "status", 200)
        
        # Test status creation
        self.run_test(
            "Create Status Check", 
            "POST", 
            "status", 
            200,
            data={"client_name": "test_client"}
        )

    def test_geocoding_endpoints(self):
        """Test geocoding endpoints"""
        print("\n=== Testing Geocoding Endpoints ===")
        
        # Test city search
        success, data = self.run_test(
            "Search London", 
            "GET", 
            "weather/geocode", 
            200,
            params={"q": "London"}
        )
        
        if success and data:
            # Use London coordinates for reverse geocoding
            london_lat = data[0]["lat"]
            london_lon = data[0]["lon"]
            
            self.run_test(
                "Reverse Geocode London", 
                "GET", 
                "weather/reverse-geocode", 
                200,
                params={"lat": london_lat, "lon": london_lon}
            )
            
            return london_lat, london_lon
        
        # Fallback coordinates for London
        return 51.5074, -0.1278

    def test_weather_endpoints(self, lat=51.5074, lon=-0.1278):
        """Test weather data endpoints"""
        print("\n=== Testing Weather Endpoints ===")
        
        # Test current weather
        self.run_test(
            "Current Weather", 
            "GET", 
            "weather/current", 
            200,
            params={"lat": lat, "lon": lon, "units": "metric"}
        )
        
        # Test forecast
        self.run_test(
            "Weather Forecast", 
            "GET", 
            "weather/forecast", 
            200,
            params={"lat": lat, "lon": lon, "units": "metric"}
        )
        
        # Test air quality
        self.run_test(
            "Air Quality", 
            "GET", 
            "weather/air-quality", 
            200,
            params={"lat": lat, "lon": lon}
        )
        
        # Test UV index
        self.run_test(
            "UV Index", 
            "GET", 
            "weather/uv-index", 
            200,
            params={"lat": lat, "lon": lon}
        )
        
        # Test weather alerts
        self.run_test(
            "Weather Alerts", 
            "GET", 
            "weather/alerts", 
            200,
            params={"lat": lat, "lon": lon, "units": "metric"}
        )

    def test_history_endpoints(self):
        """Test search history endpoints"""
        print("\n=== Testing History Endpoints ===")
        
        # Test save history
        self.run_test(
            "Save Search History", 
            "POST", 
            "weather/history", 
            200,
            params={
                "city": "London", 
                "lat": 51.5074, 
                "lon": -0.1278, 
                "country": "GB"
            }
        )
        
        # Test get history
        self.run_test(
            "Get Search History", 
            "GET", 
            "weather/history", 
            200,
            params={"limit": 5}
        )

    def test_error_cases(self):
        """Test error handling"""
        print("\n=== Testing Error Cases ===")
        
        # Test invalid city search
        self.run_test(
            "Invalid City Search", 
            "GET", 
            "weather/geocode", 
            404,
            params={"q": "InvalidCityNameThatDoesNotExist123"}
        )
        
        # Test missing parameters
        self.run_test(
            "Missing Lat/Lon for Current Weather", 
            "GET", 
            "weather/current", 
            422  # FastAPI validation error
        )

def main():
    print("🌦️  Weather API Testing Suite")
    print("=" * 50)
    
    tester = WeatherAPITester()
    
    # Run all test suites
    tester.test_basic_endpoints()
    
    # Get coordinates from geocoding test
    lat, lon = tester.test_geocoding_endpoints()
    
    # Test weather endpoints with coordinates
    tester.test_weather_endpoints(lat, lon)
    
    # Test history endpoints
    tester.test_history_endpoints()
    
    # Test error cases
    tester.test_error_cases()
    
    # Print final results
    print(f"\n📊 Final Results")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"   - {test['test']}: {test['error'][:100]}...")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())