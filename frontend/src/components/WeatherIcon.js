import { 
    Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, 
    CloudDrizzle, CloudLightning, CloudSnow, CloudFog,
    Cloudy, Wind
} from 'lucide-react';

const iconMap = {
    '01d': { icon: Sun, color: 'text-amber-400' },
    '01n': { icon: Moon, color: 'text-indigo-300' },
    '02d': { icon: CloudSun, color: 'text-amber-300' },
    '02n': { icon: CloudMoon, color: 'text-indigo-200' },
    '03d': { icon: Cloud, color: 'text-slate-400' },
    '03n': { icon: Cloud, color: 'text-slate-400' },
    '04d': { icon: Cloudy, color: 'text-slate-500' },
    '04n': { icon: Cloudy, color: 'text-slate-500' },
    '09d': { icon: CloudDrizzle, color: 'text-blue-400' },
    '09n': { icon: CloudDrizzle, color: 'text-blue-400' },
    '10d': { icon: CloudRain, color: 'text-blue-500' },
    '10n': { icon: CloudRain, color: 'text-blue-500' },
    '11d': { icon: CloudLightning, color: 'text-yellow-400' },
    '11n': { icon: CloudLightning, color: 'text-yellow-400' },
    '13d': { icon: CloudSnow, color: 'text-sky-200' },
    '13n': { icon: CloudSnow, color: 'text-sky-200' },
    '50d': { icon: CloudFog, color: 'text-slate-300' },
    '50n': { icon: CloudFog, color: 'text-slate-300' },
};

export const WeatherIcon = ({ code, size = 48, className = '' }) => {
    const iconData = iconMap[code] || iconMap['01d'];
    const IconComponent = iconData.icon;

    return (
        <IconComponent 
            className={`${iconData.color} ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

// Mini icons for forecasts
export const WeatherIconMini = ({ code }) => {
    const iconData = iconMap[code] || iconMap['01d'];
    const IconComponent = iconData.icon;

    return (
        <IconComponent className={`h-8 w-8 ${iconData.color}`} />
    );
};
