// Utility functions for NIC and mobile validation

// NIC: 12 digits OR 10 digits + 'V'/'v'
export function isValidNIC(nic: string): boolean {
  if (!nic) return false;
  return (
    /^\d{12}$/.test(nic) ||
    /^\d{9}[Vv]$/.test(nic)
  );
}

// Mobile: 10 digits starting with 0 OR +94 and 9 digits (total 12 chars)
export function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  return (
    /^0\d{9}$/.test(mobile) ||
    /^\+94\d{9}$/.test(mobile)
  );
}
