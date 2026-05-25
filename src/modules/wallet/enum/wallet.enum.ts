export enum TransactionStatus {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum WalletType {
  CUSTOMER = 'customer',
  AUTHOR = 'author',
  PLATFORM = 'platform',
}
