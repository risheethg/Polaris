import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PolarisLogo } from '@/components/PolarisLogo';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <PolarisLogo size="sm" className="hidden sm:flex" />
          <PolarisLogo size="icon" className="flex sm:hidden" />
        </Link>

        <div className="flex items-center space-x-4">
          {!loading && user && (
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};