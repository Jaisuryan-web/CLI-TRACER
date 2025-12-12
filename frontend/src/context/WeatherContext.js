import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WeatherContext = createContext();

export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};

export const WeatherProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [uvIndex, setUvIndex] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [units, setUnits] = useState('metric'); // metric or imperial
    const [searchHistory, setSearchHistory] = useState([]);

    // Fetch all weather data for a location
    const fetchWeatherData = useCallback(async (lat, lon, cityName = null, country = null) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [currentRes, forecastRes, aqiRes, uvRes, alertsRes] = await Promise.all([
                axios.get(`${API}/weather/current`, { params: { lat, lon, units } }),
                axios.get(`${API}/weather/forecast`, { params: { lat, lon, units } }),
                axios.get(`${API}/weather/air-quality`, { params: { lat, lon } }),
                axios.get(`${API}/weather/uv-index`, { params: { lat, lon } }),
                axios.get(`${API}/weather/alerts`, { params: { lat, lon, units } })
            ]);

            setCurrentWeather(currentRes.data);
            setForecast(forecastRes.data);
            setAirQuality(aqiRes.data);
            setUvIndex(uvRes.data);
            setAlerts(alertsRes.data);

            const name = cityName || currentRes.data.name;
            const countryCode = country || currentRes.data.country;
            
            setLocation({
                lat,
                lon,
                name,
                country: countryCode
            });

            // Save to history
            try {
                await axios.post(`${API}/weather/history`, null, {
                    params: { city: name, lat, lon, country: countryCode }
                });
                fetchSearchHistory();
            } catch (e) {
                console.log('Failed to save history');
            }

            // Show alerts if any warnings
            if (alertsRes.data.has_warnings) {
                toast.warning('Weather Alert', {
                    description: alertsRes.data.alerts[0]?.description || 'Check weather alerts for your area.'
                });
            }

        } catch (err) {
            console.error('Weather fetch error:', err);
            setError(err.response?.data?.detail || 'Failed to fetch weather data');
            toast.error('Error', {
                description: err.response?.data?.detail || 'Failed to fetch weather data'
            });
        } finally {
            setLoading(false);
        }
    }, [units]);

    // Search city by name
    const searchCity = async (query) => {
        try {
            const response = await axios.get(`${API}/weather/geocode`, { params: { q: query } });
            return response.data;
        } catch (err) {
            toast.error('Search Error', {
                description: err.response?.data?.detail || 'City not found'
            });
            return [];
        }
    };

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        setLoading(true);
        
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Get city name from coordinates
                    const geoRes = await axios.get(`${API}/weather/reverse-geocode`, {
                        params: { lat: latitude, lon: longitude }
                    });
                    
                    await fetchWeatherData(
                        latitude,
                        longitude,
                        geoRes.data.name,
                        geoRes.data.country
                    );
                    
                    toast.success('Location detected', {
                        description: `Weather for ${geoRes.data.name}, ${geoRes.data.country}`
                    });
                } catch (err) {
                    await fetchWeatherData(latitude, longitude);
                }
            },
            (err) => {
                setLoading(false);
                toast.error('Location Error', {
                    description: 'Unable to get your location. Please search for a city.'
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [fetchWeatherData]);

    // Fetch search history
    const fetchSearchHistory = async () => {
        try {
            const response = await axios.get(`${API}/weather/history`, { params: { limit: 5 } });
            setSearchHistory(response.data);
        } catch (err) {
            console.log('Failed to fetch history');
        }
    };

    // Toggle units
    const toggleUnits = () => {
        const newUnits = units === 'metric' ? 'imperial' : 'metric';
        setUnits(newUnits);
        if (location) {
            fetchWeatherData(location.lat, location.lon, location.name, location.country);
        }
    };

    return (
        <WeatherContext.Provider value={{
            location,
            currentWeather,
            forecast,
            airQuality,
            uvIndex,
            alerts,
            loading,
            error,
            units,
            searchHistory,
            fetchWeatherData,
            searchCity,
            getCurrentLocation,
            fetchSearchHistory,
            toggleUnits
        }}>
            {children}
        </WeatherContext.Provider>
    );
};
