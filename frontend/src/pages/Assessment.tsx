import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { PolarisLogo } from '@/components/PolarisLogo';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    id: 1,
    question: "What energizes you most in a work environment?",
    options: [
      "Solving complex technical problems",
      "Creating and designing new concepts",
      "Leading teams and making strategic decisions",
      "Analyzing data and conducting research",
      "Helping others and making a positive impact"
    ]
  },
  {
    id: 2,
    question: "When facing a challenge, your first instinct is to:",
    options: [
      "Break it down into logical components",
      "Think outside the box for creative solutions",
      "Organize resources and delegate tasks",
      "Research and gather comprehensive data",
      "Consider the human impact and stakeholder needs"
    ]
  },
  {
    id: 3,
    question: "In your ideal work day, you would spend most time:",
    options: [
      "Building or coding something functional",
      "Designing, writing, or creating content",
      "Meeting with people and making decisions",
      "Researching, analyzing, or experimenting",
      "Collaborating and supporting others"
    ]
  },
  {
    id: 4,
    question: "What type of recognition motivates you most?",
    options: [
      "Recognition for technical expertise",
      "Appreciation for creative innovation",
      "Acknowledgment of leadership success",
      "Respect for analytical insights",
      "Gratitude for helping others succeed"
    ]
  },
  {
    id: 5,
    question: "Your communication style tends to be:",
    options: [
      "Direct and detail-oriented",
      "Inspiring and visually engaging",
      "Persuasive and goal-focused",
      "Precise and evidence-based",
      "Empathetic and collaborative"
    ]
  }
];

export const Assessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = selectedOption !== null;

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      // Navigate to results with answers
      navigate('/dashboard', { state: { answers: newAnswers } });
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <PolarisLogo size="sm" />
            <Button variant="ghost" onClick={handleBack} className="text-foreground hover:text-primary">
              <ArrowLeft className="mr-2" size={16} />
              Back to Home
            </Button>
          </nav>
        </header>

        {/* Assessment Content */}
        <main className="flex-1 flex items-center justify-center px-6">
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
                  Choose the option that best describes you
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      selectedOption === index
                        ? 'border-primary bg-primary/10 glow-primary'
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
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                >
                  {isLastQuestion ? 'View Results' : 'Next'}
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
};