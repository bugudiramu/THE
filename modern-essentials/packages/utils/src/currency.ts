/**
 * Convert rupees to paise (store in DB)
 * @param rupees - Amount in rupees (e.g., 100.50)
 * @returns Amount in paise (e.g., 10050)
 */
export const toPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees (display to users)
 * @param paise - Amount in paise (e.g., 10050)
 * @returns Amount in rupees (e.g., 100.50)
 */
export const toRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Format currency for display in INR
 * @param paise - Amount in paise
 * @returns Formatted string (e.g., "₹100.50")
 */
export const formatINR = (paise: number): string => {
  const rupees = toRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
};
