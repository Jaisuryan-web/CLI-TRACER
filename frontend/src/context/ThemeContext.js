import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('weather-theme');
            if (stored) return stored;
        }
        return 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState('light');

    useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = (newTheme) => {
            root.classList.remove('light', 'dark');
            
            if (newTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
                setResolvedTheme(systemTheme);
            } else {
                root.classList.add(newTheme);
                setResolvedTheme(newTheme);
            }
        };

        applyTheme(theme);
        localStorage.setItem('weather-theme', theme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
