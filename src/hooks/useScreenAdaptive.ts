import { useState, useEffect } from 'react';

export type ScreenDevice = 'pc' | 'tablet' | 'mobile';

export interface ScreenAdaptiveInfo {
  device: ScreenDevice;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  orientation: 'landscape' | 'portrait';
  label: string;
}

export function useScreenAdaptive(): ScreenAdaptiveInfo {
  const [screenInfo, setScreenInfo] = useState<ScreenAdaptiveInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        device: 'pc',
        width: 1440,
        height: 900,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWideDesktop: true,
        orientation: 'landscape',
        label: 'PC Mode (1440px)',
      };
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 640;
    const isTablet = w >= 640 && w < 1024;
    const isDesktop = w >= 1024;
    const isWideDesktop = w >= 1440;
    const device: ScreenDevice = isMobile ? 'mobile' : isTablet ? 'tablet' : 'pc';
    const orientation: 'landscape' | 'portrait' = w >= h ? 'landscape' : 'portrait';
    const label = isMobile
      ? `Mobile (${w}px)`
      : isTablet
      ? `Tablet (${w}px)`
      : isWideDesktop
      ? `PC Ultra-Wide (${w}px)`
      : `PC Desktop (${w}px)`;

    return {
      device,
      width: w,
      height: h,
      isMobile,
      isTablet,
      isDesktop,
      isWideDesktop,
      orientation,
      label,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const isDesktop = w >= 1024;
      const isWideDesktop = w >= 1440;
      const device: ScreenDevice = isMobile ? 'mobile' : isTablet ? 'tablet' : 'pc';
      const orientation: 'landscape' | 'portrait' = w >= h ? 'landscape' : 'portrait';
      const label = isMobile
        ? `Mobile (${w}px)`
        : isTablet
        ? `Tablet (${w}px)`
        : isWideDesktop
        ? `PC Ultra-Wide (${w}px)`
        : `PC Desktop (${w}px)`;

      setScreenInfo({
        device,
        width: w,
        height: h,
        isMobile,
        isTablet,
        isDesktop,
        isWideDesktop,
        orientation,
        label,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return screenInfo;
}
