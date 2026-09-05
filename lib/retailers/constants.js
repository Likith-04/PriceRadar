/**
 * Single source of truth for supported retailers in PriceRadar.
 */

export const RETAILER_IDS = {
  AMAZON: "amazon",
  FLIPKART: "flipkart",
  RELIANCE_DIGITAL: "reliance_digital",
  CROMA: "croma",
};

export const SUPPORTED_RETAILERS = [
  RETAILER_IDS.AMAZON,
  RETAILER_IDS.FLIPKART,
  RETAILER_IDS.RELIANCE_DIGITAL,
  RETAILER_IDS.CROMA,
];

export const RETAILER_CONFIGS = {
  [RETAILER_IDS.AMAZON]: {
    id: RETAILER_IDS.AMAZON,
    name: "Amazon India",
    shortName: "Amazon",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    domain: "amazon.in",
    domains: ["amazon.in", "amazon.com", "amzn.in", "amzn.to"],
    domainRegex: /(^|\.)(amazon\.(in|com)|amzn\.(in|to))$/i,
    badgeColor: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
    },
    placeholder: "https://www.amazon.in/dp/B0...",
  },
  [RETAILER_IDS.FLIPKART]: {
    id: RETAILER_IDS.FLIPKART,
    name: "Flipkart",
    shortName: "Flipkart",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    domain: "flipkart.com",
    domains: ["flipkart.com", "dl.flipkart.com", "fkrt.it"],
    domainRegex: /(^|\.)(flipkart\.com|fkrt\.it)$/i,
    badgeColor: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/30",
      dot: "bg-blue-500",
    },
    placeholder: "https://www.flipkart.com/.../p/...",
  },
  [RETAILER_IDS.RELIANCE_DIGITAL]: {
    id: RETAILER_IDS.RELIANCE_DIGITAL,
    name: "Reliance Digital",
    shortName: "Reliance",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    domain: "reliancedigital.in",
    domains: ["reliancedigital.in"],
    domainRegex: /(^|\.)reliancedigital\.in$/i,
    badgeColor: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/30",
      dot: "bg-rose-500",
    },
    placeholder: "https://www.reliancedigital.in/.../p/...",
  },
  [RETAILER_IDS.CROMA]: {
    id: RETAILER_IDS.CROMA,
    name: "Croma",
    shortName: "Croma",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    domain: "croma.com",
    domains: ["croma.com"],
    domainRegex: /(^|\.)croma\.com$/i,
    badgeColor: {
      bg: "bg-teal-500/10 dark:bg-teal-500/20",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-500/30",
      dot: "bg-teal-500",
    },
    placeholder: "https://www.croma.com/.../p/...",
  },
};

export const SUPPORTED_RETAILERS_SUMMARY =
  "Amazon India · Flipkart · Reliance Digital · Croma";

export const UNSUPPORTED_RETAILER_MESSAGE = `This retailer isn't supported yet.\n\nPriceRadar currently supports:\n${SUPPORTED_RETAILERS_SUMMARY}`;
