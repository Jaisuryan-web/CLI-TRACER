import { motion } from 'framer-motion';
import { useWeather } from '../context/WeatherContext';
import { Sun, Shield } from 'lucide-react';

const uvColors = {
    green: 'text-emerald-500',
    yellow: 'text-amber-500',
    orange: 'text-orange-500',
    red: 'text-rose-500',
    purple: 'text-purple-500'
};

const uvBgColors = {
    green: 'bg-emerald-500/20',
    yellow: 'bg-amber-500/20',
    orange: 'bg-orange-500/20',
    red: 'bg-rose-500/20',
    purple: 'bg-purple-500/20'
};

export const UVIndex = () => {
    const { uvIndex } = useWeather();

    if (!uvIndex) return null;

    const uvPercent = Math.min((uvIndex.uv / 11) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass-card p-6 col-span-full md:col-span-2 lg:col-span-4"
            data-testid="uv-index-card"
        >
            <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-amber-400" />
                <h2 className="font-oswald text-xl uppercase tracking-wide">
                    UV Index
                </h2>
            </div>

            {/* UV Display */}
            <div className="flex items-center gap-6 mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${uvBgColors[uvIndex.color]}`}>
                    <span className={`font-oswald text-3xl font-bold ${uvColors[uvIndex.color]}`} data-testid="uv-value">
                        {uvIndex.uv}
                    </span>
                </div>
                <div>
                    <p className={`font-oswald text-2xl font-bold ${uvColors[uvIndex.color]}`} data-testid="uv-risk">
                        {uvIndex.risk}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        UV Index Scale: 0-11+
                    </p>
                </div>
            </div>

            {/* UV Scale */}
            <div className="mb-4">
                <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-purple-500 relative">
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-800 shadow-lg"
                        style={{ left: `${uvPercent}%`, transform: 'translate(-50%, -50%)' }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Extreme</span>
                </div>
            </div>

            {/* Recommendation */}
            <div className={`${uvBgColors[uvIndex.color]} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                    <Shield className={`h-5 w-5 ${uvColors[uvIndex.color]} flex-shrink-0 mt-0.5`} />
                    <p className="text-sm" data-testid="uv-recommendation">
                        {uvIndex.recommendation}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
