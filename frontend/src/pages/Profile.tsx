import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Map, User as UserIcon } from 'lucide-react'; // Added UserIcon
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  // ... (imports)
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useDebug } from '@/context/DebugContext';

interface UserProfileData {
  name: string;
  email: string;
  picture: string;
  personality: { [key: string]: number };
}

const riasecFullNames: { [key: string]: string } = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

export const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isDebugMode } = useDebug();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (!response.ok) throw new Error('Failed to fetch profile');

          const data = await response.json();
          if (!data.personality) {
            navigate('/assessment');
            return;
          }
          setProfile(data);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null; // Or a more specific error message component
  }

  const chartData = Object.keys(profile.personality).map((key) => ({
    subject: riasecFullNames[key],
    score: profile.personality[key],
    fullMark: 1,
  }));

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary/50">
          <AvatarImage src={profile.picture} alt={profile.name} />
          <AvatarFallback className="text-3xl">
            {profile.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-heading font-bold">{profile.name}</h1>
          <p className="text-lg text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-heading font-semibold mb-6 text-center">
          Your RIASEC Personality Profile
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
              <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar name={profile.name} dataKey="score" stroke="hsl(var(--primary))" fill="url(#colorUv)" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard hover>
          <h3 className="text-xl font-heading font-semibold mb-3">View Your Career Map</h3>
          <p className="text-muted-foreground mb-4">
            Explore the career constellation generated from your personality profile.
          </p>
          <Button className="w-full" onClick={() => navigate('/dashboard')}>
            <Map className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </GlassCard>
        <GlassCard hover>
          <h3 className="text-xl font-heading font-semibold mb-3">Re-take Assessment</h3>
          <p className="text-muted-foreground mb-4">
            Feel like your interests have changed? You can always take the assessment again.
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate(isDebugMode ? '/assessment?debug=true' : '/assessment')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </GlassCard>
        <GlassCard hover>
          <h3 className="text-xl font-heading font-semibold mb-3">Update Your Details</h3>
          <p className="text-muted-foreground mb-4">
            Keep your personal and financial details up-to-date for better recommendations.
          </p>
          <Button className="w-full" onClick={() => navigate('/details-form')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};