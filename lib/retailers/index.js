import {
  RETAILER_IDS,
  SUPPORTED_RETAILERS,
  RETAILER_CONFIGS,
  SUPPORTED_RETAILERS_SUMMARY,
  UNSUPPORTED_RETAILER_MESSAGE,
} from "./constants.js";
import { detectRetailer, getRetailerConfig, isSupportedRetailer } from "./detector.js";
import { amazonAdapter } from "./adapters/amazon.js";
import { flipkartAdapter } from "./adapters/flipkart.js";
import { relianceDigitalAdapter } from "./adapters/reliance-digital.js";
import { cromaAdapter } from "./adapters/croma.js";

const ADAPTERS = {
  [RETAILER_IDS.AMAZON]: amazonAdapter,
  [RETAILER_IDS.FLIPKART]: flipkartAdapter,
  [RETAILER_IDS.RELIANCE_DIGITAL]: relianceDigitalAdapter,
  [RETAILER_IDS.CROMA]: cromaAdapter,
};

/**
 * Retrieves the retailer adapter for a given retailer ID or product URL.
 * 
 * @param {string} idOrUrl 
 * @returns {import("./adapters/base.js").BaseRetailerAdapter | null}
 */
export function getRetailerAdapter(idOrUrl) {
  if (!idOrUrl) return null;
  if (ADAPTERS[idOrUrl]) {
    return ADAPTERS[idOrUrl];
  }
  const detected = detectRetailer(idOrUrl);
  return detected && ADAPTERS[detected] ? ADAPTERS[detected] : null;
}

export {
  RETAILER_IDS,
  SUPPORTED_RETAILERS,
  RETAILER_CONFIGS,
  SUPPORTED_RETAILERS_SUMMARY,
  UNSUPPORTED_RETAILER_MESSAGE,
  detectRetailer,
  getRetailerConfig,
  isSupportedRetailer,
  amazonAdapter,
  flipkartAdapter,
  relianceDigitalAdapter,
  cromaAdapter,
};
