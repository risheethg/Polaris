import React from 'react';
import { Link } from 'react-router-dom';
import { PolarisLogo } from './PolarisLogo';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TestTube2 } from 'lucide-react';
import { useDebug } from '@/context/DebugContext';

export const Header: React.FC = () => {
  const { isDebugMode, setIsDebugMode } = useDebug();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <PolarisLogo size="sm" />
        </Link>

        {/* <div className="flex items-center justify-center space-x-2">
          <TestTube2 size={16} className="text-muted-foreground" />
          <Label htmlFor="debug-mode-header" className="text-muted-foreground text-sm">
            Debug Mode
          </Label>
          <Switch id="debug-mode-header" checked={isDebugMode} onCheckedChange={setIsDebugMode} />
        </div> */}
      </div>
    </header>
  );
};