import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Define the types for the form data
interface FinancialStatus {
  current_salary?: number;
  target_salary?: number;
  risk_tolerance?: 'low' | 'medium' | 'high';
}

interface UserDetails {
  name?: string;
  email?: string;
  current_role?: string;
  years_of_experience?: number;
  education_level?: string;
  financial_status?: FinancialStatus;
}

export const PersonalDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<UserDetails>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/'); // Or wherever you want to redirect unauthenticated users
      return;
    }

    const fetchDetails = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setDetails({
            name: userData.name || '',
            email: userData.email || '',
            current_role: userData.current_role || '',
            years_of_experience: userData.years_of_experience === undefined ? '' : userData.years_of_experience,
            education_level: userData.education_level || '',
            financial_status: userData.financial_status || {
              risk_tolerance: 'medium'
            },
          });
        } else {
          toast.error('Failed to load your details.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching your details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = e.target.type === 'number';
    setDetails(prev => ({ ...prev, [name]: isNumeric && value !== '' ? parseInt(value, 10) : value }));
  };

  const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      financial_status: {
        ...prev.financial_status,
        [name]: value ? parseInt(value, 10) : undefined,
      },
    }));
  };

  const handleSelectChange = (name: keyof UserDetails | `financial_status.${keyof FinancialStatus}`) => (value: string) => {
    if (name.startsWith('financial_status.')) {
        const field = name.split('.')[1] as keyof FinancialStatus;
        setDetails(prev => ({
            ...prev,
            financial_status: {
                ...prev.financial_status,
                [field]: value
            }
        }));
    } else {
        setDetails(prev => ({ ...prev, [name as keyof UserDetails]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const idToken = await user.getIdToken();
      // Prepare only the updatable fields
      const { name, email, ...updatePayload } = details;
      
      const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        toast.success('Your details have been saved.');
        navigate('/profile');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save details.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal & Financial Details</CardTitle>
          <CardDescription>
            Help us understand your situation to provide better career guidance.
            This information is kept confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={details.name || ''} onChange={handleChange} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={details.email || ''} onChange={handleChange} disabled />
            </div>

            {/* Professional Info */}
            <div className="space-y-2">
              <Label htmlFor="current_role">Current Role / Job Title</Label>
              <Input id="current_role" name="current_role" value={details.current_role || ''} onChange={handleChange} placeholder="e.g., Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Professional Experience</Label>
              <Input id="years_of_experience" name="years_of_experience" type="number" value={details.years_of_experience || ''} onChange={handleChange} placeholder="e.g., 5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education_level">Highest Education Level</Label>
              <Select onValueChange={handleSelectChange('education_level')} value={details.education_level}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Financial Info */}
            <div className="space-y-2">
              <Label htmlFor="current_salary">Current Annual Salary (USD)</Label>
              <Input id="current_salary" name="current_salary" type="number" value={details.financial_status?.current_salary || ''} onChange={handleFinancialChange} placeholder="e.g., 80000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_salary">Target Annual Salary (USD)</Label>
              <Input id="target_salary" name="target_salary" type="number" value={details.financial_status?.target_salary || ''} onChange={handleFinancialChange} placeholder="e.g., 120000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_tolerance">Career Change Risk Tolerance</Label>
              <Select onValueChange={handleSelectChange('financial_status.risk_tolerance')} value={details.financial_status?.risk_tolerance}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your risk tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - I prefer stability</SelectItem>
                  <SelectItem value="medium">Medium - Open to some risk for growth</SelectItem>
                  <SelectItem value="high">High - Willing to take big leaps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
