export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  email_verified: boolean;
  is_active: boolean;
  interests: string[];
  personality: { [key: string]: number } | null;
}