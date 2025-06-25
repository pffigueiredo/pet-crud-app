import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-sm">
      <Sun className="h-4 w-4 text-yellow-500" />
      <Label htmlFor="theme-toggle" className="text-sm font-medium cursor-pointer">
        Dark Mode
      </Label>
      <Switch
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-purple-600"
      />
      <Moon className="h-4 w-4 text-blue-400" />
    </div>
  );
}