import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { useWeather } from '../context/WeatherContext';
import { WeatherIconMini } from './WeatherIcon';
import { Droplets } from 'lucide-react';

export const HourlyForecast = () => {
    const { forecast, units } = useWeather();

    if (!forecast?.hourly) return null;

    const tempUnit = units === 'metric' ? '°' : '°F';

    const formatHour = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { 
            hour: 'numeric',
            hour12: true
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 col-span-full"
            data-testid="hourly-forecast-card"
        >
            <h2 className="font-oswald text-xl uppercase tracking-wide mb-4">
                Hourly Forecast
            </h2>
            
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                    {forecast.hourly.map((hour, index) => (
                        <motion.div
                            key={hour.dt}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            data-testid={`hourly-item-${index}`}
                            className="flex-shrink-0 bg-secondary/30 rounded-2xl p-4 min-w-[90px] text-center"
                        >
                            <p className="text-sm text-muted-foreground mb-2">
                                {index === 0 ? 'Now' : formatHour(hour.dt)}
                            </p>
                            <div className="flex justify-center mb-2">
                                <WeatherIconMini code={hour.weather.icon} />
                            </div>
                            <p className="font-oswald text-xl font-bold">
                                {Math.round(hour.temp)}{tempUnit}
                            </p>
                            {hour.pop > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-2 text-sky-400">
                                    <Droplets className="h-3 w-3" />
                                    <span className="text-xs">{Math.round(hour.pop * 100)}%</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </motion.div>
    );
};
