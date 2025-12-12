import { motion } from 'framer-motion';
import { useWeather } from '../context/WeatherContext';
import { Wind, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';

const aqiColors = {
    1: 'bg-emerald-500',
    2: 'bg-lime-500',
    3: 'bg-amber-500',
    4: 'bg-orange-500',
    5: 'bg-rose-500'
};

const aqiDescriptions = {
    'Good': 'Air quality is satisfactory and poses little or no health risk.',
    'Fair': 'Air quality is acceptable. Some pollutants may be of concern.',
    'Moderate': 'Sensitive groups may experience health effects.',
    'Poor': 'Everyone may begin to experience health effects.',
    'Very Poor': 'Health alert: everyone may experience serious health effects.'
};

export const AirQuality = () => {
    const { airQuality } = useWeather();

    if (!airQuality) return null;

    const aqiPercent = (airQuality.aqi / 5) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 col-span-full md:col-span-2 lg:col-span-4"
            data-testid="air-quality-card"
        >
            <div className="flex items-center gap-2 mb-4">
                <Wind className="h-5 w-5 text-primary" />
                <h2 className="font-oswald text-xl uppercase tracking-wide">
                    Air Quality
                </h2>
            </div>

            {/* AQI Display */}
            <div className="flex items-center gap-6 mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${aqiColors[airQuality.aqi]}`}>
                    <span className="font-oswald text-3xl font-bold text-white" data-testid="aqi-value">
                        {airQuality.aqi}
                    </span>
                </div>
                <div>
                    <p className="font-oswald text-2xl font-bold" data-testid="aqi-label">
                        {airQuality.aqi_label}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {aqiDescriptions[airQuality.aqi_label]}
                    </p>
                </div>
            </div>

            {/* AQI Scale */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Good</span>
                    <span>Very Poor</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 relative">
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-800 shadow-lg"
                        style={{ left: `${aqiPercent}%`, transform: 'translate(-50%, -50%)' }}
                    />
                </div>
            </div>

            {/* Pollutant Details */}
            <div className="grid grid-cols-2 gap-3">
                <PollutantItem label="PM2.5" value={airQuality.pm2_5} unit="μg/m³" />
                <PollutantItem label="PM10" value={airQuality.pm10} unit="μg/m³" />
                <PollutantItem label="O₃" value={airQuality.o3} unit="μg/m³" />
                <PollutantItem label="NO₂" value={airQuality.no2} unit="μg/m³" />
            </div>
        </motion.div>
    );
};

const PollutantItem = ({ label, value, unit }) => (
    <div className="bg-secondary/30 rounded-xl p-3">
        <p className="data-label">{label}</p>
        <p className="font-oswald text-lg font-semibold">
            {value?.toFixed(1) || 'N/A'} <span className="text-xs text-muted-foreground">{unit}</span>
        </p>
    </div>
);
