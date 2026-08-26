import { useState, useEffect } from 'react';

export interface ScreenSizeInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useScreenSize(): ScreenSizeInfo {
  const [screenInfo, setScreenInfo] = useState<ScreenSizeInfo>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width: w,
      height: h,
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isLargeDesktop: w >= 1440,
      orientation: w > h ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    let timeoutId: any = null;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setScreenInfo({
          width: w,
          height: h,
          isMobile: w < 768,
          isTablet: w >= 768 && w < 1024,
          isDesktop: w >= 1024,
          isLargeDesktop: w >= 1440,
          orientation: w > h ? 'landscape' : 'portrait',
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenInfo;
}
