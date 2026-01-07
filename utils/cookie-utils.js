/**
 * Cookie Consent Management Utilities
 * GDPR-compliant cookie consent system
 * Storage: localStorage with 12-month expiry
 */

const CONSENT_KEY = 'yourlove_cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365; // 12 months (GDPR standard)

/**
 * Cookie Categories
 */
export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  FUNCTIONAL: 'functional',
  MARKETING: 'marketing',
};

/**
 * Default consent state (all categories disabled except necessary)
 */
const DEFAULT_CONSENT = {
  version: CONSENT_VERSION,
  timestamp: null,
  categories: {
    [COOKIE_CATEGORIES.NECESSARY]: true, // Always enabled
    [COOKIE_CATEGORIES.ANALYTICS]: false,
    [COOKIE_CATEGORIES.FUNCTIONAL]: false,
    [COOKIE_CATEGORIES.MARKETING]: false,
  },
};

/**
 * Check if consent data exists and is still valid (not expired)
 */
export function hasValidConsent() {
  try {
    const consent = loadConsent();
    if (!consent || !consent.timestamp) return false;

    // Check if version matches
    if (consent.version !== CONSENT_VERSION) return false;

    // Check if consent has expired (12 months)
    const consentDate = new Date(consent.timestamp);
    const expiryDate = new Date(consentDate);
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

    return new Date() < expiryDate;
  } catch (error) {
    console.error('Error checking consent validity:', error);
    return false;
  }
}

/**
 * Load consent preferences from localStorage
 */
export function loadConsent() {
  try {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading consent:', error);
    return null;
  }
}

/**
 * Save consent preferences to localStorage
 */
export function saveConsent(categories) {
  try {
    if (typeof window === 'undefined') return false;

    const consent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: {
        [COOKIE_CATEGORIES.NECESSARY]: true, // Always enabled
        [COOKIE_CATEGORIES.ANALYTICS]: !!categories[COOKIE_CATEGORIES.ANALYTICS],
        [COOKIE_CATEGORIES.FUNCTIONAL]: !!categories[COOKIE_CATEGORIES.FUNCTIONAL],
        [COOKIE_CATEGORIES.MARKETING]: !!categories[COOKIE_CATEGORIES.MARKETING],
      },
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    
    // Trigger custom event for other parts of the app to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
    }

    return true;
  } catch (error) {
    console.error('Error saving consent:', error);
    return false;
  }
}

/**
 * Accept all cookie categories
 */
export function acceptAllCookies() {
  return saveConsent({
    [COOKIE_CATEGORIES.NECESSARY]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: true,
    [COOKIE_CATEGORIES.FUNCTIONAL]: true,
    [COOKIE_CATEGORIES.MARKETING]: true,
  });
}

/**
 * Reject all non-essential cookies (only necessary cookies enabled)
 */
export function rejectNonEssentialCookies() {
  return saveConsent({
    [COOKIE_CATEGORIES.NECESSARY]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: false,
    [COOKIE_CATEGORIES.FUNCTIONAL]: false,
    [COOKIE_CATEGORIES.MARKETING]: false,
  });
}

/**
 * Check if a specific cookie category is enabled
 */
export function isCategoryEnabled(category) {
  const consent = loadConsent();
  if (!consent || !hasValidConsent()) return category === COOKIE_CATEGORIES.NECESSARY;
  
  return consent.categories[category] === true;
}

/**
 * Get all consent preferences
 */
export function getConsentPreferences() {
  const consent = loadConsent();
  if (!consent || !hasValidConsent()) {
    return DEFAULT_CONSENT.categories;
  }
  
  return consent.categories;
}

/**
 * Clear all consent data (for testing or user request)
 */
export function clearConsent() {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.removeItem(CONSENT_KEY);
    
    // Trigger custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentCleared'));
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing consent:', error);
    return false;
  }
}

/**
 * Get consent expiry date
 */
export function getConsentExpiryDate() {
  const consent = loadConsent();
  if (!consent || !consent.timestamp) return null;

  const consentDate = new Date(consent.timestamp);
  const expiryDate = new Date(consentDate);
  expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

  return expiryDate;
}
