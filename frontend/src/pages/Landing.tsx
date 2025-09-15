import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { PolarisLogo } from '@/components/PolarisLogo';
import { ArrowRight, Navigation, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <PolarisLogo size="sm" />
            <div className="space-x-4">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                About
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Sign In
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6">
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
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold glow-primary"
                  onClick={() => navigate('/assessment')}
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Free assessment • Personalized results • No registration required
                </p>
              </div>
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
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-muted-foreground">
          <p>&copy; 2024 Polaris. Guiding your career journey through the stars.</p>
        </footer>
      </div>
    </div>
  );
};