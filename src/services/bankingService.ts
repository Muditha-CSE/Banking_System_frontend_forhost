import api from './api';
import {
  LoginCredentials,
  Admin,
  Agent,
  Customer,
  Branch,
  SavingsAccount,
  FixedDeposit,
  Transaction,
  Transfer,
  ApiResponse
} from '../types';

// Public API
export const authService = {
  login: (credentials: LoginCredentials): Promise<ApiResponse> =>
    api.post('/public/loginofficers', credentials),
};

// Admin API
export const adminService = {
  addAdmin: (admin: Admin): Promise<ApiResponse> =>
    api.post('/admin/addAdmin', admin),
  
  addAgent: (agent: Agent): Promise<ApiResponse> =>
    api.post('/admin/addAgent', agent),
  
  addBranch: (branch: Branch): Promise<ApiResponse> =>
    api.post('/admin/addbranch', branch),
  
  getAgentWiseTransactions: (): Promise<ApiResponse> =>
    api.get('/admin/getAgentwiseTransactions'),
  
  getAccountWiseTransactions: (): Promise<ApiResponse> =>
    api.get('/admin/getAccountwiseTransactions'),
  
  getActiveFDs: (): Promise<ApiResponse> =>
    api.get('/admin/getActiveFDs'),
  
  getMonthlyInterestDistribution: (): Promise<ApiResponse> =>
    api.get('/admin/getMonthlyInterestDistribution'),
  
  getCustomerActivity: (nic: string): Promise<ApiResponse> =>
    api.get(`/admin/getCustomerActivity/${nic}`),
  
  getCustomerActivityForAcc: (nic: string, account_no: string): Promise<ApiResponse> =>
    api.get(`/admin/getCustomerActivityForAcc/${nic}/${account_no}`),
  
  getSystemLogs: (): Promise<ApiResponse> =>
    api.get('/admin/getSystemLogs'),
  
  getAuditLogs: (): Promise<ApiResponse> =>
    api.get('/admin/auditlogs'),

  // Agent management (admin only)
  listAgents: (): Promise<ApiResponse> =>
    api.get('/admin/agents'),
  getAgent: (username: string): Promise<ApiResponse> =>
    api.get(`/admin/agents/${encodeURIComponent(username)}`),
  updateAgent: (username: string, payload: Partial<{ name: string; email: string; phone: string; nic: string; branch_id: number; newUsername: string; password: string }>): Promise<ApiResponse> =>
    api.put(`/admin/agents/${encodeURIComponent(username)}`, payload),
  // replacementAgentUsername is required for agent deletion
  deleteAgent: (username: string, replacementAgentUsername: string): Promise<ApiResponse> =>
    api.delete(`/admin/agents/${encodeURIComponent(username)}?replacementAgentUsername=${encodeURIComponent(replacementAgentUsername)}`),
  // Deactivate agent (admin only)
  deactivateAgent: (username: string, replacementAgentUsername: string): Promise<ApiResponse> =>
    api.post(`/admin/agents/${encodeURIComponent(username)}/deactivate`, { replacementAgentUsername }),
  // Activate agent (admin only)
  activateAgent: (username: string): Promise<ApiResponse> =>
    api.post(`/admin/agents/${encodeURIComponent(username)}/activate`),
  // Admin self-deactivation
  deactivateSelf: (): Promise<ApiResponse> =>
    api.post('/admin/deactivate-self'),

  // List deactivated admins
  listDeactivatedAdmins: (): Promise<ApiResponse> =>
    api.get('/admin/deactivated-admins'),

  // Reactivate admin
  reactivateAdmin: (user_id: number): Promise<ApiResponse> =>
    api.post(`/admin/reactivate-admin`, { user_id }),
};

// Agent API
export const agentService = {
  addCustomer: (customer: Customer): Promise<ApiResponse> =>
    api.post('/agent/addcustomer', customer),
  
  addSavingsAccount: (account: SavingsAccount): Promise<ApiResponse> =>
    api.post('/agent/addsavingsaccount', account),
  
  addFixedDeposit: (fd: FixedDeposit): Promise<ApiResponse> =>
    api.post('/agent/addfixeddeposit', fd),
  
  makeDeposit: (transaction: Transaction): Promise<ApiResponse> =>
    api.post('/agent/deposit', transaction),
  
  makeWithdraw: (transaction: Transaction): Promise<ApiResponse> =>
    api.post('/agent/withdraw', transaction),
  
  accToAccTransfer: (transfer: Transfer): Promise<ApiResponse> =>
    api.post('/agent/transfer', transfer),

  // Customer management (agent only)
  listCustomers: (): Promise<ApiResponse> =>
    api.get('/agent/customers'),
  getCustomer: (nic: string): Promise<ApiResponse> =>
    api.get(`/agent/customers/${encodeURIComponent(nic)}`),
  updateCustomer: (nic: string, payload: Partial<{ name: string; email: string; phone: string; gender: string; address: string; DOB: string; password: string }>): Promise<ApiResponse> =>
    api.put(`/agent/customers/${encodeURIComponent(nic)}`, payload),
  bulkCreateCustomers: (customers: Customer[]): Promise<ApiResponse> =>
    api.post('/agent/customers/bulk', { customers }),
  deleteCustomer: (nic: string): Promise<ApiResponse> =>
    api.delete(`/agent/customers/${encodeURIComponent(nic)}`),
  reactivateCustomer: (nic: string): Promise<ApiResponse> =>
    api.patch(`/agent/customers/${encodeURIComponent(nic)}/reactivate`),
};