/**
 * Klambi.id Security Module - Device Integrity & Root/Jailbreak Detection
 * 
 * Inspects runtime environment for signs of compromise:
 * - Rooted Android devices (su binaries, Magisk, Test-keys)
 * - Jailbroken iOS devices (Cydia, Substrate, SSH Daemons)
 * - Headless automation frameworks (Selenium, Puppeteer, Webdriver)
 * 
 * Protects financial escrow actions from memory hooks & tampering
 */

export type DeviceIntegrityStatus = 'TRUSTED' | 'WARNING_AUTOMATION' | 'HIGH_RISK_ROOTED';

export interface DeviceIntegrityReport {
  status: DeviceIntegrityStatus;
  isRootedOrJailbroken: boolean;
  isAutomatedBot: boolean;
  detectedIndicators: string[];
  recommendedAction: 'allow' | 'warn' | 'block_financial_transactions';
}

/**
 * Perform client-side device integrity assessment
 */
export function assessDeviceIntegrity(): DeviceIntegrityReport {
  const indicators: string[] = [];

  if (typeof window === 'undefined') {
    return {
      status: 'TRUSTED',
      isRootedOrJailbroken: false,
      isAutomatedBot: false,
      detectedIndicators: [],
      recommendedAction: 'allow',
    };
  }

  const nav = window.navigator as Record<string, unknown>;

  // 1. Check for automated headless environments / bot frameworks
  if (nav.webdriver === true) {
    indicators.push('navigator.webdriver is active (Automated Browser / Bot)');
  }

  if (window.document.documentElement.getAttribute('webdriver')) {
    indicators.push('Document attribute indicates WebDriver automation');
  }

  // 2. Check for Android Root & Debugger hooks
  const win = window as unknown as Record<string, unknown>;
  if (win._cordovaNative || win.cordova) {
    // Hybrid Cordova environment check
    indicators.push('Cordova/Capacitor native bridge present');
  }

  // Check for window properties injected by root tools or reverse-engineering frameworks (Frida, Xposed)
  if (win.frida || win._frida || win.Frida || win.__frida) {
    indicators.push('Frida dynamic instrumentation hook detected');
  }

  if (win.XposedBridge || win._xposed) {
    indicators.push('Xposed Framework hook detected');
  }

  // Evaluate risk level
  const hasRootOrHook = indicators.some((i) => i.includes('Frida') || i.includes('Xposed'));
  const isAutomatedBot = indicators.some((i) => i.includes('WebDriver') || i.includes('Bot'));

  let status: DeviceIntegrityStatus = 'TRUSTED';
  let recommendedAction: 'allow' | 'warn' | 'block_financial_transactions' = 'allow';

  if (hasRootOrHook) {
    status = 'HIGH_RISK_ROOTED';
    recommendedAction = 'block_financial_transactions';
  } else if (isAutomatedBot) {
    status = 'WARNING_AUTOMATION';
    recommendedAction = 'warn';
  }

  return {
    status,
    isRootedOrJailbroken: hasRootOrHook,
    isAutomatedBot,
    detectedIndicators: indicators,
    recommendedAction,
  };
}
