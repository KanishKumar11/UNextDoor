/**
 * Currency and pricing utilities - Simplified version
 * Primary focus: India (INR) vs Rest of World (USD)
 */

// Standardized currency configuration matching frontend
export const SUPPORTED_CURRENCIES = {
  'IN': {
    code: 'INR',
    symbol: '₹',
    exchangeRate: 1.0,
    name: 'Indian Rupee'
  },
  'DEFAULT': {
    code: 'USD',
    symbol: '$',
    exchangeRate: 0.012,
    name: 'US Dollar'
  }
};

// Standardized conversion rates - single source of truth
export const CURRENCY_EXCHANGE_RATES = {
  INR_TO_USD: 0.012,
  USD_TO_INR: 83.33
};

export const PLAN_PRICES = {
  // Base prices in INR, USD prices calculated
  'basic_monthly': { INR: 149, USD: 1.99 },
  'standard_quarterly': { INR: 399, USD: 4.99 },
  'pro_yearly': { INR: 999, USD: 11.99 }
};

/**
 * Detect user's country from request headers
 * Simplified: India vs Rest of World
 */
export function detectUserCountry(req) {
  // Check for Cloudflare country header
  if (req.headers['cf-ipcountry']) {
    const country = req.headers['cf-ipcountry'];
    return country === 'IN' ? 'IN' : 'DEFAULT';
  }

  // Check for X-Forwarded-For country
  if (req.headers['x-country-code']) {
    const country = req.headers['x-country-code'];
    return country === 'IN' ? 'IN' : 'DEFAULT';
  }

  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    for (const lang of languages) {
      const langCode = lang.split('-')[1];
      if (langCode && langCode.toUpperCase() === 'IN') {
        return 'IN';
      }
    }
  }

  // Check user-agent for Indian indicators
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.toLowerCase().includes('india') || userAgent.toLowerCase().includes('in')) {
    return 'IN';
  }

  // Default to international (USD)
  return 'DEFAULT';
}

/**
 * Get currency for user's country
 */
export function getUserCurrency(req) {
  const country = detectUserCountry(req);
  return SUPPORTED_CURRENCIES[country];
}

/**
 * Convert INR price to USD using standardized rates
 */
export function convertINRToUSD(inrPrice) {
  return Math.round((inrPrice * CURRENCY_EXCHANGE_RATES.INR_TO_USD) * 100) / 100;
}

/**
 * Convert USD price to INR using standardized rates
 */
export function convertUSDToINR(usdPrice) {
  return Math.round((usdPrice * CURRENCY_EXCHANGE_RATES.USD_TO_INR) * 100) / 100;
}

/**
 * Get the actual payment amount in INR (what Razorpay will charge)
 * This ensures consistency between display price and actual charge
 */
export function getPaymentAmountINR(displayPrice, displayCurrency) {
  if (displayCurrency === 'INR') {
    return displayPrice;
  }

  if (displayCurrency === 'USD') {
    return convertUSDToINR(displayPrice);
  }

  return displayPrice; // Fallback
}

/**
 * Get plan price in user's currency
 */
export function getPlanPrice(planId, req) {
  const currency = getUserCurrency(req);
  const prices = PLAN_PRICES[planId];

  if (!prices) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  return {
    amount: prices[currency.code],
    currency: currency.code,
    symbol: currency.symbol,
    originalINR: prices.INR // Always include original INR price for payment processing
  };
}

/**
 * Get plan price with both display and payment amounts
 */
export function getPlanPriceWithPaymentAmount(planId, req) {
  const currency = getUserCurrency(req);
  const prices = PLAN_PRICES[planId];

  if (!prices) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const displayAmount = prices[currency.code];
  const paymentAmountINR = getPaymentAmountINR(displayAmount, currency.code);

  return {
    displayAmount,
    displayCurrency: currency.code,
    displaySymbol: currency.symbol,
    paymentAmountINR,
    paymentCurrency: 'INR',
    paymentSymbol: '₹',
    originalINR: prices.INR
  };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount, currencyCode) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'USD' ? 2 : 0,
    maximumFractionDigits: currencyCode === 'USD' ? 2 : 0
  });

  return formatter.format(amount);
}
