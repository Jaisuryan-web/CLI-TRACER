import { motion } from 'framer-motion';
import { 
    Droplets, Wind, Eye, Gauge, Sunrise, Sunset, 
    ThermometerSun, CloudRain, ArrowUp 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { WeatherIcon } from './WeatherIcon';

export const CurrentWeather = () => {
    const { currentWeather, location, units } = useWeather();

    if (!currentWeather || !location) return null;

    const tempUnit = units === 'metric' ? '°C' : '°F';
    const speedUnit = units === 'metric' ? 'm/s' : 'mph';

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 md:p-8 col-span-full lg:col-span-8 row-span-2"
            data-testid="current-weather-card"
        >
            {/* Location Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-tight">
                        {location.name}
                    </h1>
                    <p className="text-muted-foreground font-manrope">
                        {location.country} • {new Date().toLocaleDateString([], { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Updated: {formatTime(currentWeather.dt)}
                </div>
            </div>

            {/* Main Weather Display */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-8">
                {/* Weather Icon */}
                <div className="animate-float">
                    <WeatherIcon 
                        code={currentWeather.weather.icon} 
                        size={120}
                        className="drop-shadow-lg"
                    />
                </div>

                {/* Temperature */}
                <div className="text-center md:text-left">
                    <div className="flex items-start justify-center md:justify-start">
                        <span className="font-oswald text-7xl md:text-8xl font-bold tracking-tighter">
                            {Math.round(currentWeather.temp)}
                        </span>
                        <span className="font-oswald text-3xl font-light mt-2">{tempUnit}</span>
                    </div>
                    <p className="font-oswald text-xl md:text-2xl uppercase tracking-wide text-muted-foreground">
                        {currentWeather.weather.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Feels like {Math.round(currentWeather.feels_like)}{tempUnit}
                    </p>
                </div>

                {/* High/Low */}
                <div className="flex gap-6 md:gap-8 md:ml-auto">
                    <div className="text-center">
                        <ArrowUp className="h-5 w-5 text-rose-400 mx-auto mb-1" />
                        <p className="data-label">High</p>
                        <p className="font-oswald text-2xl font-bold">
                            {Math.round(currentWeather.temp_max)}{tempUnit}
                        </p>
                    </div>
                    <div className="text-center">
                        <ArrowUp className="h-5 w-5 text-sky-400 mx-auto mb-1 rotate-180" />
                        <p className="data-label">Low</p>
                        <p className="font-oswald text-2xl font-bold">
                            {Math.round(currentWeather.temp_min)}{tempUnit}
                        </p>
                    </div>
                </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WeatherDetail 
                    icon={<Droplets className="h-5 w-5 text-sky-400" />}
                    label="Humidity"
                    value={`${currentWeather.humidity}%`}
                    testId="humidity-value"
                />
                <WeatherDetail 
                    icon={<Wind className="h-5 w-5 text-emerald-400" />}
                    label="Wind"
                    value={`${currentWeather.wind_speed} ${speedUnit}`}
                    testId="wind-value"
                />
                <WeatherDetail 
                    icon={<Eye className="h-5 w-5 text-purple-400" />}
                    label="Visibility"
                    value={`${currentWeather.visibility} km`}
                    testId="visibility-value"
                />
                <WeatherDetail 
                    icon={<Gauge className="h-5 w-5 text-amber-400" />}
                    label="Pressure"
                    value={`${currentWeather.pressure} hPa`}
                    testId="pressure-value"
                />
            </div>

            {/* Sunrise/Sunset */}
            <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3">
                    <Sunrise className="h-6 w-6 text-amber-400" />
                    <div>
                        <p className="data-label">Sunrise</p>
                        <p className="font-oswald text-lg font-semibold" data-testid="sunrise-value">
                            {formatTime(currentWeather.sunrise)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sunset className="h-6 w-6 text-orange-400" />
                    <div>
                        <p className="data-label">Sunset</p>
                        <p className="font-oswald text-lg font-semibold" data-testid="sunset-value">
                            {formatTime(currentWeather.sunset)}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const WeatherDetail = ({ icon, label, value, testId }) => (
    <div className="bg-secondary/30 rounded-2xl p-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="data-label mb-1">{label}</p>
        <p className="font-oswald text-xl font-semibold" data-testid={testId}>{value}</p>
    </div>
);
