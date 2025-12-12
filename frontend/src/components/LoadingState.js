import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun } from 'lucide-react';

export const LoadingState = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
                className="relative"
                animate={{ 
                    y: [0, -10, 0],
                }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Cloud className="h-24 w-24 text-slate-400" />
                <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <CloudRain className="h-8 w-8 text-sky-400" />
                </motion.div>
            </motion.div>
            <p className="mt-6 text-lg text-muted-foreground font-manrope">
                Loading weather data...
            </p>
        </div>
    );
};

export const EmptyState = ({ onGetLocation }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
        >
            <motion.div
                animate={{ 
                    rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sun className="h-24 w-24 text-amber-400 mb-6" />
            </motion.div>
            <h2 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3">
                Weather Dashboard
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
                Search for a city or use your current location to get started with real-time weather updates.
            </p>
            <button
                onClick={onGetLocation}
                data-testid="get-location-cta"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-manrope font-semibold hover:bg-primary/90 transition-colors"
            >
                Use My Location
            </button>
        </motion.div>
    );
};
