import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, History, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useWeather } from '../context/WeatherContext';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const { searchCity, fetchWeatherData, getCurrentLocation, searchHistory, loading } = useWeather();

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setSearching(true);
                const data = await searchCity(query);
                setResults(data);
                setIsOpen(true);
                setSearching(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchCity]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (item) => {
        setQuery('');
        setIsOpen(false);
        await fetchWeatherData(item.lat, item.lon, item.name, item.country);
    };

    const handleLocationClick = () => {
        getCurrentLocation();
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        data-testid="city-search-input"
                        type="text"
                        placeholder="Search city..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        className="pl-10 pr-4 h-12 rounded-full bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all font-manrope"
                    />
                    {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
                <Button
                    data-testid="location-button"
                    onClick={handleLocationClick}
                    disabled={loading}
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <MapPin className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (results.length > 0 || searchHistory.length > 0) && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <div className="p-2">
                                <p className="data-label px-3 py-2">Search Results</p>
                                {results.map((item, index) => (
                                    <button
                                        key={`${item.lat}-${item.lon}-${index}`}
                                        data-testid={`search-result-${index}`}
                                        onClick={() => handleSelect(item)}
                                        className="w-full text-left px-3 py-3 hover:bg-secondary/50 rounded-xl transition-colors flex items-center gap-3"
                                    >
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.state ? `${item.state}, ` : ''}{item.country}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : searchHistory.length > 0 ? (
                            <div className="p-2">
                                <p className="data-label px-3 py-2">Recent Searches</p>
                                {searchHistory.map((item, index) => (
                                    <button
                                        key={`history-${item.id || index}`}
                                        data-testid={`history-item-${index}`}
                                        onClick={() => handleSelect(item)}
                                        className="w-full text-left px-3 py-3 hover:bg-secondary/50 rounded-xl transition-colors flex items-center gap-3"
                                    >
                                        <History className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{item.city}</p>
                                            <p className="text-sm text-muted-foreground">{item.country}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
