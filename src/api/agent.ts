export async function fetchSavingsPlans() {
  const res = await fetch('/api/agent/savingsplans');
  if (!res.ok) throw new Error('Failed to fetch savings plans');
  const data = await res.json();
  return data.plans;
}
