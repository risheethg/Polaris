import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { apiConfig } from '@/lib/api-config';

interface QuizQuestion {
  question_text: string;
  options: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface ApiResponse<T> {
  status: 'success' | 'failure';
  message: string;
  data?: T;
  error_details?: string;
}

interface UserAnswer {
  question_text: string;
  selected_answer: string;
}

export const useLevelAssessment = (mapId: string | undefined) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const jobTitle = mapId ? mapId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  useEffect(() => {
    const generateQuiz = async () => {
      if (!jobTitle || !user) return;
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch(apiConfig.endpoints.levelTest.generateQuiz, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ job_title: jobTitle }),
        });

        const result: ApiResponse<QuizData> = await response.json();

        if (result.status !== 'success' || !result.data) {
          throw new Error(result.message || 'Failed to generate quiz.');
        }

        setQuizData(result.data);
      } catch (error) {
        console.error(error);
        toast.error('Could not load the assessment. Please try again later.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      generateQuiz();
    } else if (!authLoading && !user) {
      navigate('/'); // Redirect if not authenticated
    }
  }, [jobTitle, user, authLoading, navigate]);

  const handleAnswerChange = useCallback((questionText: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionText]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user || !quizData) return;

    const userAnswers: UserAnswer[] = Object.entries(answers).map(([question_text, selected_answer]) => ({
      question_text,
      selected_answer,
    }));

    if (userAnswers.length !== quizData.questions.length) {
      toast.warning('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(apiConfig.endpoints.levelTest.submitQuiz, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ user_id: user.uid, job_title: jobTitle, answers: userAnswers }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to submit quiz.');
      }
      toast.success(result.message || 'Assessment complete! Generating your career map.');
      navigate(`/career-map/${mapId}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not submit your assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [user, quizData, answers, jobTitle, navigate, mapId]);

  return {
    loading: loading || authLoading,
    submitting,
    quizData,
    answers,
    jobTitle,
    handleAnswerChange,
    handleSubmit,
  };
};