export interface CustomerProfilePayload {
  id: string;
  first_name: string;
  last_name: string;
  other_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  last_login: Date;
}
