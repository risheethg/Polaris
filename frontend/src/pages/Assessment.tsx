import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const questions = [
  // Realistic
  { id: 1, question: "Fix electrical things" },
  { id: 2, question: "Repair cars" },
  { id: 3, question: "Be a building contractor" },
  { id: 4, question: "Work with power tools" },
  { id: 5, question: "Build things with wood" },
  { id: 6, question: "Drive a truck or a bus" },
  { id: 7, question: "Work on a farm" },
  { id: 8, question: "Work with animals" },
  // Investigative
  { id: 9, question: "Do chemistry experiments" },
  { id: 10, question: "Read scientific books or magazines" },
  { id: 11, question: "Work in a research lab" },
  { id: 12, question: "Be a biologist" },
  { id: 13, question: "Solve math or logic puzzles" },
  { id: 14, question: "Study physics or chemistry" },
  { id: 15, question: "Be an astronomer" },
  { id: 16, question: "Use a microscope or computer" },
  // Artistic
  { id: 17, question: "Sketch, draw, or paint" },
  { id: 18, question: "Play a musical instrument" },
  { id: 19, question: "Be a singer or musician" },
  { id: 20, question: "Act in a play or movie" },
  { id: 21, question: "Write stories or poetry" },
  { id: 22, question: "Be a professional dancer" },
  { id: 23, question: "Design furniture or buildings" },
  { id: 24, question: "Read art or music magazines" },
  // Social
  { id: 25, question: "Teach or train people" },
  { id: 26, question: "Help people with their problems" },
  { id: 27, question: "Work as a volunteer" },
  { id: 28, question: "Be a social worker" },
  { id: 29, question: "Go to parties or social events" },
  { id: 30, question: "Be a nurse or physical therapist" },
  { id: 31, question: "Take care of children" },
  { id: 32, question: "Be a high school teacher" },
  // Enterprising
  { id: 33, question: "Start my own business" },
  { id: 34, question: "Sell a product or service" },
  { id: 35, question: "Be a manager or supervisor" },
  { id: 36, question: "Give speeches or presentations" },
  { id: 37, question: "Lead a team or group" },
  { id: 38, question: "Be a salesperson" },
  { id: 39, question: "Run for political office" },
  { id: 40, question: "Be a company president" },
  // Conventional
  { id: 41, question: "Organize files and records" },
  { id: 42, question: "Use a computer for data entry" },
  { id: 43, question: "Be an accountant" },
  { id: 44, question: "Manage an office" },
  { id: 45, question: "Keep detailed financial records" },
  { id: 46, question: "Be a bookkeeper" },
  { id: 47, question: "Follow a budget" },
  { id: 48, question: "Work with numbers in a business setting" },
];

export const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('debug') === 'true') {
      // Pre-fill answers for questions 1-47 with random-ish values (mostly neutral)
      // and jump to the last question.
      const debugAnswers = Array.from({ length: questions.length - 1 }, (_, i) => (i % 5));
      setAnswers(debugAnswers);
      setCurrentQuestion(questions.length - 1);
      toast.info("Debug mode enabled. Starting at the last question.");
    }
  }, [location.search]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = selectedOption !== null;

  const handleSubmit = async (finalAnswers: number[]) => {
    if (!user) {
      toast.error("You must be signed in to submit your assessment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('http://127.0.0.1:8000/api/v1/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ answers: finalAnswers })
      });

      if (!response.ok) {
        throw new Error("Failed to submit assessment.");
      }

      toast.success("Assessment submitted! Generating your results...");
      navigate('/results');
    } catch (error) {
      console.error("Assessment submission failed:", error);
      toast.error("There was a problem submitting your results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionSelect = async (optionIndex: number) => {
    // Instantly set the selected option for visual feedback
    setSelectedOption(optionIndex);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    // Use a short delay to allow the user to see their selection before advancing
    setTimeout(async () => {
      if (isLastQuestion) {
        await handleSubmit(newAnswers);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(answers[currentQuestion + 1] ?? null); // Pre-fill next answer if available
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col"
    >
      {/* Assessment Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            {/* Progress */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-heading font-bold">Personality Assessment</h1>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Question Card */}
            <GlassCard className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-heading font-semibold">
                  {questions[currentQuestion].question}
                </h2>
                <p className="text-muted-foreground">
                  Select the option that best describes how much you would enjoy this activity.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      selectedOption === index
                        ? 'border-primary bg-primary/10 glow-primary' // 0 for Dislike, 1 for Like
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {selectedOption === index && (
                        <CheckCircle className="text-primary" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="border-border"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Previous
                </Button>
                
                {isLastQuestion && selectedOption !== null && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Last question answered. Redirecting...</span>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
};