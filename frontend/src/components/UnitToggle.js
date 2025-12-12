import { useWeather } from '../context/WeatherContext';
import { Button } from './ui/button';

export const UnitToggle = () => {
    const { units, toggleUnits } = useWeather();

    return (
        <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleUnits}
            className="rounded-full font-oswald font-bold"
            data-testid="unit-toggle"
        >
            {units === 'metric' ? '°C' : '°F'}
        </Button>
    );
};
