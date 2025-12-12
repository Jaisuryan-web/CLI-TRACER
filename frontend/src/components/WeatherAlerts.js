import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from '../context/WeatherContext';
import { 
    AlertTriangle, CloudLightning, CloudRain, Snowflake, 
    Wind, Thermometer, CloudFog, X 
} from 'lucide-react';
import { useState } from 'react';

const alertIcons = {
    thunderstorm: CloudLightning,
    thunderstorm_forecast: CloudLightning,
    rain: CloudRain,
    snow: Snowflake,
    wind: Wind,
    heat: Thermometer,
    cold: Thermometer,
    fog: CloudFog
};

const severityColors = {
    warning: 'bg-rose-500/20 border-rose-500/50 text-rose-100',
    watch: 'bg-amber-500/20 border-amber-500/50 text-amber-100',
    advisory: 'bg-sky-500/20 border-sky-500/50 text-sky-100'
};

const severityIconColors = {
    warning: 'text-rose-400',
    watch: 'text-amber-400',
    advisory: 'text-sky-400'
};

export const WeatherAlerts = () => {
    const { alerts } = useWeather();
    const [dismissed, setDismissed] = useState([]);

    if (!alerts?.alerts?.length) return null;

    const visibleAlerts = alerts.alerts.filter((_, i) => !dismissed.includes(i));

    if (!visibleAlerts.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-full space-y-3"
            data-testid="weather-alerts"
        >
            <AnimatePresence>
                {alerts.alerts.map((alert, index) => {
                    if (dismissed.includes(index)) return null;
                    
                    const IconComponent = alertIcons[alert.type] || AlertTriangle;
                    
                    return (
                        <motion.div
                            key={`alert-${index}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            data-testid={`alert-${index}`}
                            className={`rounded-2xl border p-4 ${severityColors[alert.severity]}`}
                        >
                            <div className="flex items-start gap-3">
                                <IconComponent className={`h-6 w-6 flex-shrink-0 ${severityIconColors[alert.severity]}`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-oswald text-lg font-bold uppercase">
                                            {alert.title}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            alert.severity === 'warning' ? 'bg-rose-500/30' :
                                            alert.severity === 'watch' ? 'bg-amber-500/30' :
                                            'bg-sky-500/30'
                                        }`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-90">{alert.description}</p>
                                </div>
                                <button
                                    onClick={() => setDismissed([...dismissed, index])}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    data-testid={`dismiss-alert-${index}`}
                                >
                                    <X className="h-5 w-5 opacity-70" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};
