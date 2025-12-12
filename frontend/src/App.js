import { useEffect } from "react";
import "@/App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { WeatherProvider, useWeather } from "./context/WeatherContext";
import { Toaster } from "./components/ui/sonner";
import { SearchBar } from "./components/SearchBar";
import { ThemeToggle } from "./components/ThemeToggle";
import { UnitToggle } from "./components/UnitToggle";
import { CurrentWeather } from "./components/CurrentWeather";
import { HourlyForecast } from "./components/HourlyForecast";
import { DailyForecast } from "./components/DailyForecast";
import { AirQuality } from "./components/AirQuality";
import { UVIndex } from "./components/UVIndex";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { LoadingState, EmptyState } from "./components/LoadingState";
import { CloudSun } from "lucide-react";

const WeatherDashboard = () => {
    const { 
        currentWeather, 
        loading, 
        getCurrentLocation,
        fetchSearchHistory 
    } = useWeather();

    useEffect(() => {
        fetchSearchHistory();
    }, [fetchSearchHistory]);

    return (
        <div className="min-h-screen noise-overlay">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <CloudSun className="h-8 w-8 text-primary" />
                            <span className="font-oswald text-2xl font-bold uppercase tracking-tight">
                                StormTracker
                            </span>
                        </div>

                        {/* Search */}
                        <div className="flex-1 flex justify-center">
                            <SearchBar />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <UnitToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
                {loading ? (
                    <LoadingState />
                ) : currentWeather ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                        {/* Weather Alerts */}
                        <WeatherAlerts />
                        
                        {/* Current Weather - Hero */}
                        <CurrentWeather />
                        
                        {/* Daily Forecast - Side */}
                        <DailyForecast />
                        
                        {/* Hourly Forecast - Full Width */}
                        <HourlyForecast />
                        
                        {/* Air Quality */}
                        <AirQuality />
                        
                        {/* UV Index */}
                        <UVIndex />
                    </div>
                ) : (
                    <EmptyState onGetLocation={getCurrentLocation} />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
                    <p>Powered by OpenWeather API</p>
                </div>
            </footer>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <WeatherProvider>
                <WeatherDashboard />
                <Toaster position="top-right" richColors />
            </WeatherProvider>
        </ThemeProvider>
    );
}

export default App;
