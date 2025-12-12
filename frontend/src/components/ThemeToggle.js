import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const ThemeToggle = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    data-testid="theme-toggle"
                >
                    {resolvedTheme === 'dark' ? (
                        <Moon className="h-5 w-5" />
                    ) : (
                        <Sun className="h-5 w-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0">
                <DropdownMenuItem 
                    onClick={() => setTheme('light')}
                    className={theme === 'light' ? 'bg-secondary' : ''}
                    data-testid="theme-light"
                >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setTheme('dark')}
                    className={theme === 'dark' ? 'bg-secondary' : ''}
                    data-testid="theme-dark"
                >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setTheme('system')}
                    className={theme === 'system' ? 'bg-secondary' : ''}
                    data-testid="theme-system"
                >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
