import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    // Check if app is installed
    const checkInstalled = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
      setIsInstalled(installed);
    };

    // Check for install prompt
    const checkInstallPrompt = () => {
      const prompt = (window as any).deferredPrompt;
      setShowInstallPrompt(!!prompt);
    };

    // Initial checks
    checkMobile();
    checkInstalled();
    checkInstallPrompt();

    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', () => {
      setShowInstallPrompt(true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Install app function
  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      (window as any).deferredPrompt = null;
    }
  };

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return {
    isMobile,
    isInstalled,
    showInstallPrompt,
    installApp,
    triggerHaptic
  };
};
