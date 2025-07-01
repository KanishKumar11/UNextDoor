/**
 * Currency and pricing utilities
 */

export const SUPPORTED_CURRENCIES = {
  'IN': { code: 'INR', symbol: '₹', exchangeRate: 1 },
  'US': { code: 'USD', symbol: '$', exchangeRate: 0.012 },
  'GB': { code: 'GBP', symbol: '£', exchangeRate: 0.0095 },
  'EU': { code: 'EUR', symbol: '€', exchangeRate: 0.011 },
  'JP': { code: 'JPY', symbol: '¥', exchangeRate: 1.8 },
  'KR': { code: 'KRW', symbol: '₩', exchangeRate: 16.2 },
  'CN': { code: 'CNY', symbol: '¥', exchangeRate: 0.086 }
};

export const PLAN_PRICES = {
  'basic_monthly': { INR: 149, USD: 1.99, EUR: 1.79, GBP: 1.49, JPY: 299, KRW: 2400, CNY: 14 },
  'standard_quarterly': { INR: 399, USD: 4.99, EUR: 4.49, GBP: 3.99, JPY: 799, KRW: 6400, CNY: 36 },
  'pro_yearly': { INR: 999, USD: 11.99, EUR: 10.99, GBP: 9.99, JPY: 1799, KRW: 15900, CNY: 86 }
};

/**
 * Detect user's country from request headers
 */
export function detectUserCountry(req) {
  // Check for Cloudflare country header
  if (req.headers['cf-ipcountry']) {
    return req.headers['cf-ipcountry'];
  }
  
  // Check for X-Forwarded-For country
  if (req.headers['x-country-code']) {
    return req.headers['x-country-code'];
  }
  
  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    for (const lang of languages) {
      const langCode = lang.split('-')[1];
      if (langCode && SUPPORTED_CURRENCIES[langCode.toUpperCase()]) {
        return langCode.toUpperCase();
      }
    }
  }
  
  // Default to India
  return 'IN';
}

/**
 * Get currency for user's country
 */
export function getUserCurrency(req) {
  const country = detectUserCountry(req);
  return SUPPORTED_CURRENCIES[country] || SUPPORTED_CURRENCIES['IN'];
}

/**
 * Get plan price in user's currency
 */
export function getPlanPrice(planId, req) {
  const currency = getUserCurrency(req);
  const prices = PLAN_PRICES[planId];
  
  if (!prices) {
    throw new Error(`Plan ${planId} not found`);
  }
  
  const price = prices[currency.code];
  if (!price) {
    // Fallback to INR price converted to user's currency
    const inrPrice = prices.INR;
    return Math.round(inrPrice * currency.exchangeRate);
  }
  
  return price;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount, currencyCode) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2
  });
  
  return formatter.format(amount);
}
