import { TransactionStatus, TransactionType } from '../enum/wallet.enum';

export interface IDebitRequestPayload {
  user_id: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
  balance_after?: number;
  balance_before?: number;
  status?: TransactionStatus;
  payment_reference?: string;
}

export interface IDebitResponsePayload {
  message?: string;
  user_id: string;
  payment_reference?: string;
  balance?: number;
  amount?: number;
  status: TransactionStatus;
}

export interface ICreditRequestPayload {
  user_id: string;
  wallet_id?: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
  balance?: number;
  balance_after?: number;
  balance_before?: number;
  status?: TransactionStatus;
  payment_reference?: string;
}

export interface ICreditResponsePayload {
  user_id: number;
  payment_reference: string;
  balance: number;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
}
