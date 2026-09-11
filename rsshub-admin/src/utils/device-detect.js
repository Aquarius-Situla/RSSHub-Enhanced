/* ============================================================================
 * RSSHub Enhanced — Device Detection & Layout Routing (device-detect.js)
 * Ported and adapted from sys-memorial Apple device architecture
 * ============================================================================ */

/* Detect iPad across legacy and modern iPadOS versions (iPadOS 13+ spoofing desktop MacIntel) */
export function isIPadDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isLegacyIPad = /iPad/i.test(ua) || /iPad/i.test(platform);
  const isModernIPad = (platform === 'MacIntel' || ua.includes('Macintosh')) && navigator.maxTouchPoints > 1;
  return Boolean(isLegacyIPad || isModernIPad);
}

/* Detect iPhone and iPod Touch */
export function isIPhoneDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  return /iPhone|iPod/i.test(ua) || platform === 'iPhone' || platform === 'iPod';
}

/* Detect Android Phone (contains Mobile token) */
export function isAndroidPhoneDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android.*Mobile/i.test(ua);
}

/* Detect Android Tablet (contains Android without Mobile token) */
export function isAndroidTabletDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android(?!.*Mobile)/i.test(ua);
}

/* Comprehensive Smartphone detection (iPhone or Android phone or small touch screen) */
export function isPhoneDevice() {
  if (isIPhoneDevice() || isAndroidPhoneDevice()) return true;
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
    if (hasTouch && !isIPadDevice() && !isAndroidTabletDevice()) {
      const minDim = Math.min(window.screen.width, window.screen.height);
      if (minDim > 0 && minDim <= 480) {
        return true;
      }
    }
  }
  return false;
}

/* Comprehensive Tablet detection (iPad or Android tablet) */
export function isTabletDevice() {
  return isIPadDevice() || isAndroidTabletDevice();
}

/* General Mobile Device (Phone or Tablet) */
export function isMobileDevice() {
  return isPhoneDevice() || isTabletDevice();
}

/* True Desktop/Laptop (Non-touch PC/Mac or desktop monitor) */
export function isDesktopDevice() {
  return !isMobileDevice();
}

/* ============================================================================
 * Layout Mode Determination (Device Fingerprint Primary, Screen Size Secondary)
 * 1. Mobile devices (including ALL iPads) ALWAYS use the Mobile Layout.
 * 2. True Desktop/laptops use Desktop Layout if window.innerWidth > 768px.
 * ============================================================================ */
export function isMobileLayout() {
  if (isMobileDevice()) {
    return true;
  }
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false;
}

export function isDesktopLayout() {
  return !isMobileLayout();
}

/* ============================================================================
 * HTML Root & Body Device Classes Initializer
 * ============================================================================ */
export function initDeviceLayout() {
  if (typeof document === 'undefined') return;

  const docEl = document.documentElement;
  const isMobile = isMobileLayout();
  const isPhone = isPhoneDevice();
  const isTablet = isTabletDevice();
  const isIPad = isIPadDevice();
  const isIPhone = isIPhoneDevice();

  if (isMobile) {
    docEl.classList.add('device-mobile');
    docEl.classList.remove('device-desktop');
    if (document.body) {
      document.body.classList.add('device-mobile');
      document.body.classList.remove('device-desktop');
    }
  } else {
    docEl.classList.add('device-desktop');
    docEl.classList.remove('device-mobile');
    if (document.body) {
      document.body.classList.add('device-desktop');
      document.body.classList.remove('device-mobile');
    }
  }

  if (isPhone) {
    docEl.classList.add('device-phone');
    if (document.body) document.body.classList.add('device-phone');
  }
  if (isTablet) {
    docEl.classList.add('device-tablet');
    if (document.body) document.body.classList.add('device-tablet');
  }
  if (isIPad) {
    docEl.classList.add('device-ipad');
    if (document.body) document.body.classList.add('device-ipad');
  }
  if (isIPhone) {
    docEl.classList.add('device-iphone');
    if (document.body) document.body.classList.add('device-iphone');
  }

  /* Enable immediate CSS :active pseudo-class response on iOS Safari WebKit */
  if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', () => {}, { passive: true });
  }

  /* Detect iOS / PWA Standalone Mode */
  const isIOSStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
  const isPWAStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (isIOSStandalone || isPWAStandalone) {
    docEl.classList.add('is-standalone');
    if (document.body) document.body.classList.add('is-standalone');
  }
}

/* ============================================================================
 * iOS Standalone WebApp Viewport & Tab Bar Synchronizer
 * Solves WebKit "chin gap" and status bar offset bugs in standalone mode.
 * ============================================================================ */
export function syncStandaloneTabBar() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const isIOSStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
  const isPWAStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (!isIOSStandalone && !isPWAStandalone) return;

  document.documentElement.classList.add('is-standalone');
  const tabBar = document.querySelector('.apple-tab-bar');
  if (!tabBar) return;

  const isPortrait = window.innerHeight >= window.innerWidth;
  const currentScreenH = isPortrait
    ? Math.max(window.screen.height, window.screen.width)
    : Math.min(window.screen.height, window.screen.width);
  const diff = currentScreenH - window.innerHeight;

  /* Ensure tab bar is cleanly anchored to bottom: 0 without negative offset clipping */
  document.documentElement.style.setProperty('--tab-bar-standalone-bottom', '0px');
  tabBar.style.removeProperty('bottom');
}
