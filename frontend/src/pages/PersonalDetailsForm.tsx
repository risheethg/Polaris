import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface UserDetails {
  current_role: string;
  years_of_experience: number;
  education_level: string;
  financial_status: {
    current_salary: number;
    household_income: number;
    monthly_expenses: number;
    dependents: number;
    target_salary: number;
    risk_tolerance: 'low' | 'medium' | 'high' | '';
  };
}

export const PersonalDetailsForm = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [details, setDetails] = useState<UserDetails>({
    current_role: '',
    years_of_experience: 0,
    education_level: '',
    financial_status: {
      current_salary: 0,
      household_income: 0,
      monthly_expenses: 0,
      dependents: 0,
      target_salary: 0,
      risk_tolerance: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('debug') === 'true') {
      setDetails({
        current_role: 'Software Engineer',
        years_of_experience: 5,
        education_level: "Bachelor's Degree",
        financial_status: {
          current_salary: 85000,
          household_income: 120000,
          monthly_expenses: 4000,
          dependents: 1,
          target_salary: 100000,
          risk_tolerance: 'medium',
        },
      });
      toast.info("Debug mode enabled: Personal details have been pre-filled.");
    }
  }, [location.search]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isFinancial = name.startsWith('financial_status.');

    if (isFinancial) {
      const field = name.split('.')[1];
      setDetails(prev => ({
        ...prev,
        financial_status: {
          ...prev.financial_status,
          [field]: parseInt(value, 10) || 0,
        },
      }));
    } else {
      setDetails(prev => ({ ...prev, [name]: name === 'years_of_experience' ? parseInt(value, 10) : value }));
    }
  };

  const handleSelectChange = (name: keyof UserDetails | `financial_status.${keyof UserDetails['financial_status']}`, value: string) => {
    if (name.startsWith('financial_status.')) {
      const field = name.split('.')[1] as keyof UserDetails['financial_status'];
      setDetails(prev => ({
        ...prev,
        financial_status: {
          ...prev.financial_status,
          [field]: value,
        },
      }));
    } else {
      setDetails(prev => ({ ...prev, [name as keyof UserDetails]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to save your details.");
      return;
    }
    setIsSubmitting(true);

    const promise = async () => {
      const idToken = await user.getIdToken();
      const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(details)
      });

      if (!response.ok) {
        throw new Error("Failed to save details.");
      }
      
      // On success, navigate to the assessment page
      const isDebug = new URLSearchParams(location.search).get('debug') === 'true';
      navigate(isDebug ? '/assessment?debug=true' : '/assessment');
      return response.json();
    };

    toast.promise(promise, {
      loading: 'Saving your details...',
      success: 'Details saved successfully! Proceeding to assessment...',
      error: (err) => err.message || 'Could not save details. Please try again.',
      finally: () => setIsSubmitting(false),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <Card className="max-w-2xl w-full">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Tell Us About Yourself</CardTitle>
            <CardDescription>
              This information helps us tailor your career recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-2">
              <Label htmlFor="current_role">Current Role / Job Title</Label>
              <Input id="current_role" name="current_role" value={details.current_role} onChange={handleChange} placeholder="e.g., Software Engineer, Student" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Professional Experience</Label>
              <Input id="years_of_experience" name="years_of_experience" type="number" value={details.years_of_experience} onChange={handleChange} min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education_level">Highest Level of Education</Label>
              <Select name="education_level" onValueChange={(value) => handleSelectChange('education_level', value)} required>
                <SelectTrigger id="education_level">
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Financial Details */}
            <div className="space-y-2">
              <Label htmlFor="current_salary">Your Current Annual Salary (USD)</Label>
              <Input id="current_salary" name="financial_status.current_salary" type="number" value={details.financial_status.current_salary} onChange={handleChange} min="0" placeholder="e.g., 75000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="household_income">Total Annual Household Income (USD)</Label>
              <Input id="household_income" name="financial_status.household_income" type="number" value={details.financial_status.household_income} onChange={handleChange} min="0" placeholder="e.g., 110000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_expenses">Average Monthly Expenses (USD)</Label>
              <Input id="monthly_expenses" name="financial_status.monthly_expenses" type="number" value={details.financial_status.monthly_expenses} onChange={handleChange} min="0" placeholder="e.g., 3000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_salary">Target Annual Salary (USD)</Label>
              <Input id="target_salary" name="financial_status.target_salary" type="number" value={details.financial_status.target_salary} onChange={handleChange} min="0" placeholder="e.g., 90000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_tolerance">Career Change Risk Tolerance</Label>
              <Select name="risk_tolerance" onValueChange={(value) => handleSelectChange('financial_status.risk_tolerance', value)} required>
                <SelectTrigger id="risk_tolerance">
                  <SelectValue placeholder="Select your risk tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - I prefer stability and gradual growth.</SelectItem>
                  <SelectItem value="medium">Medium - I'm open to some risk for better opportunities.</SelectItem>
                  <SelectItem value="high">High - I'm willing to take big risks for high rewards.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Save and Continue to Assessment
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};