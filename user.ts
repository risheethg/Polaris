export interface FinancialStatus {
  current_salary?: number;
  householdIncome?: number;
  monthlyExpenses?: number;
  dependents?: number;
  target_salary?: number;
  riskTolerance?: 'low' | 'medium' | 'high' | '';
}

export interface User {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  personality?: { [key: string]: number };
  financial_status?: FinancialStatus;
  // Add other fields from your backend User model as needed
}