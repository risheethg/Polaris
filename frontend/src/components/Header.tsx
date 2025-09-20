import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PolarisLogo } from './PolarisLogo';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, Settings, TestTube2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useDebug } from '@/context/DebugContext';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("You have been signed out.");
      navigate('/');
    } catch (error) {
      console.error("Sign Out Failed:", error);
      toast.error("Could not sign you out. Please try again.");
    }
  };

  const { isDebugMode, setIsDebugMode } = useDebug();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to={user?.personality ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <PolarisLogo size="sm" />
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center space-x-2">
            <TestTube2 size={16} className="text-muted-foreground" />
            <Label htmlFor="debug-mode-header" className="text-muted-foreground text-sm">
              Debug Mode
            </Label>
            <Switch id="debug-mode-header" checked={isDebugMode} onCheckedChange={setIsDebugMode} />
          </div>

          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() || <UserIcon />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate('/')}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
};