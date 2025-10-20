// Shared TypeScript interfaces for report data structures
export interface Transaction {
  id: number;
  amount: number;
  type: string;
  date: string;
  account_no: string;
  agent_username?: string;
  customer_nic?: string;
}

export interface AgentWiseTransaction {
  username: string;
  total_deposits: number;
  total_withdrawals: number;
  total_accToacc: number;
  total_acctoacc?: number; // PG lowercase fallback
  deposit_count: number;
  withdrawal_count: number;
  accToacc_count: number;
  acctoacc_count?: number; // PG lowercase fallback
  total_transactions: number;
  total_amount: number;
}

export interface AccountWiseTransaction {
  account_no: string;
  total_deposits: number;
  total_withdrawals: number;
  total_sent: number;
  total_received: number;
  deposit_count: number;
  withdrawal_count: number;
  sent_count: number;
  received_count: number;
  // Optional totals from backend; may not always be present
  total_transaction_amount?: number;
  total_transaction_count?: number;
}

export interface FixedDeposit {
  fd_account_no: string;
  customer_nic: string;
  customer_name: string;
  agent_username: string;
  amount: number;
  start_date: string;
  end_date: string;
  interest_rate: number;
  status: string;
  next_interest_date?: string;
}

export interface SystemLog {
  log_id: number;
  activity_type: string;
  description: string;
  changed_at: string;
  user_id: number;
}

export interface AuditLog {
  audit_id: number;
  table_name: string;
  operation: string;
  changed_at: string;
  changed_by: number;
  old_values?: any;
  new_values?: any;
}

export interface CustomerActivityRow { [key: string]: any }

export type GenericRow = Record<string, any>;
