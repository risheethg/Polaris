import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLevelAssessment } from '@/hooks/useLevelAssessment';

export const LevelAssessment = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const {
    loading,
    submitting,
    quizData,
    answers,
    jobTitle,
    handleAnswerChange,
    handleSubmit,
  } = useLevelAssessment(mapId);

  const progress = useMemo(() => {
    if (!quizData) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / quizData.questions.length) * 100;
  }, [answers, quizData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your assessment...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p>Could not load quiz data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-heading">{quizData.title}</CardTitle>
          <CardDescription>
            Let's gauge your current skill level for the '{jobTitle}' role to create a tailored career map for you.
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-8">
          {quizData.questions.map((q, index) => (
            <div key={index}>
              <p className="font-semibold mb-4">{index + 1}. {q.question_text}</p>
              <RadioGroup
                value={answers[q.question_text] || ''}
                onValueChange={(value) => handleAnswerChange(q.question_text, value)}
              >
                {q.options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                    <Label htmlFor={`q${index}-o${i}`} className="font-normal">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};