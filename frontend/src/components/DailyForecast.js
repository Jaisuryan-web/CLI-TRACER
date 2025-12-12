import { motion } from 'framer-motion';
import { useWeather } from '../context/WeatherContext';
import { WeatherIconMini } from './WeatherIcon';
import { Droplets, ArrowUp, ArrowDown } from 'lucide-react';

export const DailyForecast = () => {
    const { forecast, units } = useWeather();

    if (!forecast?.daily) return null;

    const tempUnit = units === 'metric' ? '°' : '°F';

    const formatDay = (dateStr, index) => {
        if (index === 0) return 'Today';
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { weekday: 'short' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 col-span-full lg:col-span-4"
            data-testid="daily-forecast-card"
        >
            <h2 className="font-oswald text-xl uppercase tracking-wide mb-4">
                5-Day Forecast
            </h2>
            
            <div className="space-y-3">
                {forecast.daily.map((day, index) => (
                    <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        data-testid={`daily-item-${index}`}
                        className="flex items-center justify-between bg-secondary/30 rounded-2xl p-4"
                    >
                        <div className="flex-1">
                            <p className="font-semibold">{formatDay(day.date, index)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(day.date)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <WeatherIconMini code={day.icon} />
                            {day.pop_max > 0 && (
                                <div className="flex items-center text-sky-400">
                                    <Droplets className="h-3 w-3" />
                                    <span className="text-xs ml-1">{Math.round(day.pop_max * 100)}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-1">
                                <ArrowUp className="h-4 w-4 text-rose-400" />
                                <span className="font-oswald font-bold">
                                    {Math.round(day.temp_max)}{tempUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ArrowDown className="h-4 w-4 text-sky-400" />
                                <span className="font-oswald text-muted-foreground">
                                    {Math.round(day.temp_min)}{tempUnit}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
