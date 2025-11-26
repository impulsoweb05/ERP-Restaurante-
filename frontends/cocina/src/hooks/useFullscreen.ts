'use client';

import { useCallback } from 'react';

export const useFullscreen = () => {
  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (elem as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    } else if ((elem as unknown as { msRequestFullscreen?: () => void }).msRequestFullscreen) {
      (elem as unknown as { msRequestFullscreen: () => void }).msRequestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
      (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
    } else if ((document as unknown as { msExitFullscreen?: () => void }).msExitFullscreen) {
      (document as unknown as { msExitFullscreen: () => void }).msExitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  const isFullscreen = typeof document !== 'undefined' && !!document.fullscreenElement;

  return {
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreen,
  };
};
