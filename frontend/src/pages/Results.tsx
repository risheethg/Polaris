import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Star, Telescope, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Personality {
  [key: string]: number;
}

const riasecFullNames: { [key: string]: string } = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

const riasecDescriptions: { [key: string]: string } = {
    R: 'The "Doers" - Practical, hands-on, and action-oriented.',
    I: 'The "Thinkers" - Analytical, curious, and observant.',
    A: 'The "Creators" - Expressive, original, and independent.',
    S: 'The "Helpers" - Cooperative, supportive, and empathetic.',
    E: 'The "Persuaders" - Ambitious, sociable, and energetic.',
    C: 'The "Organizers" - Precise, methodical, and detail-oriented.',
};

export const Results = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonality = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          // Poll the backend until the personality vector is available
          const poll = async (retries = 10, delay = 1500): Promise<Personality> => {
            const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
              headers: { Authorization: `Bearer ${idToken}` },
            });
            if (!response.ok) throw new Error('Failed to fetch user data');
            const data = await response.json();
            if (data.personality) {
              return data.personality;
            }
            if (retries > 0) {
              await new Promise(res => setTimeout(res, delay));
              return poll(retries - 1, delay);
            }
            throw new Error('Personality results not available in time.');
          };

          const p = await poll();
          setPersonality(p);
        } catch (error) {
          console.error('Failed to fetch personality:', error);
          navigate('/assessment'); // Or show an error message
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchPersonality();
    }
  }, [user, authLoading, navigate]);

  const sortedPersonality = personality
    ? Object.entries(personality).sort(([, a], [, b]) => b - a)
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
            className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center space-y-4"
          >
            <Telescope className="h-12 w-12 text-primary animate-pulse" />
            <h2 className="text-2xl font-heading text-muted-foreground">
              Your results are being calculated...
            </h2>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto max-w-3xl p-6 text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-2">
              <Star className="mx-auto h-12 w-12 text-primary" />
              <h1 className="text-4xl font-heading font-bold">Your Personality Profile</h1>
              <p className="text-lg text-muted-foreground">Based on the Holland Codes (RIASEC)</p>
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-4">
              {sortedPersonality.map(([code, score], index) => (
                <motion.div key={code} variants={itemVariants} className="p-4 border rounded-lg bg-card/50 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{index + 1}</span>
                        <div>
                            <h3 className="text-xl font-semibold font-heading">{riasecFullNames[code]} <span className="text-sm font-light text-muted-foreground">({code})</span></h3>
                            <p className="text-muted-foreground">{riasecDescriptions[code]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-lg">
                        <BarChart3 className="h-5 w-5 text-secondary" />
                        <span>{(score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button size="lg" onClick={() => navigate('/dashboard')}>View Your Career Constellation</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};