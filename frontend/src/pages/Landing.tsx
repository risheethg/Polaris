import { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { PolarisLogo } from '@/components/PolarisLogo'; // Keep for hero
import { ArrowRight, Loader2, Navigation, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase';
import { toast } from 'sonner';

// A simple Google icon component for the button
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.9 0 6.9 1.6 9 3.6l6.5-6.5C35.3 2.5 30.1 0 24 0 14.9 0 7.3 5.4 4.1 13.2l7.8 6C13.8 13.3 18.5 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.8c-.6 3-2.2 5.5-4.8 7.2l7.3 5.7c4.3-4 6.9-9.9 6.9-17.2z"/>
    <path fill="#FBBC05" d="M11.9 28.2c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-7.8-6C1.6 18.3 0 22.5 0 27.4s1.6 9.1 4.1 12.8l7.8-6z"/>
    <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15.1-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.8 2.2-5.5 0-10.2-3.8-11.9-9L4.1 39.2C7.3 44.6 14.9 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // This state will track if the user has completed the assessment
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const checkAssessmentStatus = async () => {
      // Only run check if user is loaded and authenticated
      if (user && !loading) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', { headers: { 'Authorization': `Bearer ${idToken}` } });
          if (response.ok) {
            const userData = await response.json();
            setHasCompletedAssessment(!!userData.personality);
          }
        } catch (error) {
          console.error("Failed to check user assessment status:", error);
          setHasCompletedAssessment(false);
        }
      }
    };
    checkAssessmentStatus();
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Sparkles className="text-primary" size={24} />,
      title: "AI-Powered Analysis",
      description: "Advanced personality assessment using cutting-edge AI to understand your unique strengths and interests."
    },
    {
      icon: <Navigation className="text-secondary" size={24} />,
      title: "Career Navigation",
      description: "Get personalized career pathways mapped out like constellations, showing you exactly where to go next."
    },
    {
      icon: <Target className="text-accent" size={24} />,
      title: "Precision Guidance",
      description: "Receive precise, actionable steps tailored to your goals, skills, and career aspirations."
    }
  ];

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const promise = () => new Promise(async (resolve, reject) => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
  
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        };

        // 1. Try to register the user first
        let response = await fetch('http://127.0.0.1:8000/api/v1/users/register', {
          method: 'POST',
          headers,
        });

        // 2. If the user already exists (409 Conflict), then log them in.
        if (response.status === 409) {
          console.log("User already registered. Attempting to log in.");
          response = await fetch('http://127.0.0.1:8000/api/v1/users/token', {
            method: 'POST',
            headers,
          });
        }

        // 3. If either request failed for another reason, throw an error.
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
  
        navigate('/assessment');
        // 4. Check for personality data to decide where to navigate.
        const meResponse = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
          method: 'GET',
          headers,
        });

        if (meResponse.ok) {
          const userData = await meResponse.json();
          setHasCompletedAssessment(!!userData.personality);
          navigate(userData.personality ? '/dashboard' : '/assessment'); // Navigate after sign-in
        } else {
          navigate('/assessment'); // Fallback to assessment on error
        }
        resolve(result.user);
      } catch (error) {
        console.error("Google Sign-In Failed:", error);
        reject(error);
      } finally {
        setIsSigningIn(false);
      }
    });

    toast.promise(promise, {
      loading: 'Signing you in...',
      success: (data: any) => `Welcome back, ${data.displayName?.split(' ')[0]}!`,
      error: 'Could not sign you in. Please try again.',
    });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Hero Content */}
            <div className="space-y-8 reveal">
              <PolarisLogo size="xl" className="justify-center" />
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-heading font-light text-muted-foreground max-w-3xl mx-auto">
                  Your Personal Career Navigator
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Discover your perfect career path through AI-powered personality analysis and data-driven insights. 
                  Navigate your future like the stars—with precision, confidence, and inspiration.
                </p>
              </div>
              
              {!loading && (
                <div className="space-y-4">
                  {user ? (
                    <>
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold glow-primary"
                        onClick={() => navigate(hasCompletedAssessment ? '/dashboard' : '/assessment')}
                      >
                        {hasCompletedAssessment ? 'View Your Dashboard' : 'Begin Your Journey'}
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                      <p className="text-sm text-muted-foreground">Continue where you left off.</p>
                    </>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold glow-primary" 
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                    >
                      {isSigningIn ? (
                        <Loader2 className="mr-3 animate-spin" size={24} />
                      ) : (
                        <GoogleIcon className="mr-3" />
                      )}
                      {isSigningIn ? 'Please wait...' : 'Sign In with Google to Begin'}
                    </Button>
                  )}
                </div>
              )}

            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {features.map((feature, index) => (
                <GlassCard key={index} hover className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-card">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-muted-foreground">
        <p>&copy; 2024 Polaris. Guiding your career journey through the stars.</p>
      </footer>
    </div>
  );
};