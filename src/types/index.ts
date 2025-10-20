export interface User {
  userId: string;
  username: string;
  role: 'admin' | 'agent' | 'public' | 'customer';
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Admin {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  NIC: string;
}

export interface Agent {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  NIC: string;
  branch_id: string;
}

export interface Customer {
  username: string;
  name: string;
  email: string;
  phone: string;
  NIC: string;
  gender: string;
  address: string;
  DOB: string;
  password?: string;
}

export interface Branch {
  branch_name: string;
  branch_address: string;
  telephone_no: string;
  working_hours_start: string;
  working_hours_end: string;
}

export interface SavingsAccount {
  created_customer: string;
  users: AccountUser[];
  initial_deposit: number;
  plan_id: string;
}

export interface AccountUser {
  nic: string;
  role: 'primary' | 'secondary';
}

export interface FixedDeposit {
  account_no: string;
  NIC: string;
  amount: number;
  fd_plan_id: string;
}

export interface Transaction {
  account_no: string;
  amount: number;
  transaction_type?: 'deposit' | 'withdraw';
}

export interface Transfer {
  from_account: string;
  to_account: string;
  amount: number;
}

// Agent operation request shapes (match backend controller expectations)
export interface AgentDepositRequest {
  customer_nic: string;
  account_no: string;
  amount: number;
}

export interface AgentWithdrawRequest {
  customer_nic: string;
  account_no: string;
  amount: number;
}

export interface AgentTransferRequest {
  sender_account_no: string;
  receiver_account_no: string;
  amount: number;
  sender_NIC: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}