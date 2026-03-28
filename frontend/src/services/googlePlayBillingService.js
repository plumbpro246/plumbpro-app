/**
 * Google Play Billing Service for PlumbPro
 * 
 * Detects if running on Android via Capacitor, and uses Google Play Billing
 * instead of Stripe for subscription purchases.
 * 
 * On web/PWA, falls back to Stripe checkout.
 */

const isCapacitorAndroid = () => {
  try {
    return window.Capacitor?.getPlatform() === "android";
  } catch {
    return false;
  }
};

const isNativePlatform = () => {
  try {
    return window.Capacitor?.isNativePlatform() === true;
  } catch {
    return false;
  }
};

/**
 * Start a Google Play Billing purchase flow (Android only)
 * Calls the native GooglePlayBilling Capacitor plugin
 */
const startGooglePlayPurchase = async (productId) => {
  if (!isCapacitorAndroid()) {
    throw new Error("Google Play Billing is only available on Android");
  }

  const { Plugins } = await import("@capacitor/core");
  const { GooglePlayBilling } = Plugins;

  // Launch native purchase flow
  const result = await GooglePlayBilling.startPurchaseFlow({ productId });
  return {
    purchaseToken: result.purchaseToken,
    orderId: result.orderId,
    productId: result.productIds?.[0] || productId,
  };
};

/**
 * Query available products from Google Play (Android only)
 */
const queryGooglePlayProducts = async (productIds) => {
  if (!isCapacitorAndroid()) return [];

  try {
    const { Plugins } = await import("@capacitor/core");
    const { GooglePlayBilling } = Plugins;
    const result = await GooglePlayBilling.queryProducts({ productIds });
    return result.products || [];
  } catch (err) {
    console.error("Failed to query Google Play products:", err);
    return [];
  }
};

/**
 * Acknowledge a Google Play subscription (Android only)
 */
const acknowledgeGooglePlayPurchase = async (purchaseToken) => {
  if (!isCapacitorAndroid()) return;

  const { Plugins } = await import("@capacitor/core");
  const { GooglePlayBilling } = Plugins;
  await GooglePlayBilling.acknowledgeSubscription({ purchaseToken });
};

export {
  isCapacitorAndroid,
  isNativePlatform,
  startGooglePlayPurchase,
  queryGooglePlayProducts,
  acknowledgeGooglePlayPurchase,
};
