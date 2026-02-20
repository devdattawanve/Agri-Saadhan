'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase';
import { RecaptchaVerifier } from 'firebase/auth';

/**
 * A hook to provide a Firebase RecaptchaVerifier instance.
 * @param containerId The ID of the DOM element where the reCAPTCHA will be rendered.
 * @returns A RecaptchaVerifier instance or null if not ready.
 */
export function useRecaptcha(containerId: string) {
  const auth = useAuth();
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth) return;

    // Ensure container exists before creating verifier
    const container = document.getElementById(containerId);
    if (!container) return;

    const newVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });

    setVerifier(newVerifier);

    // render() returns a promise that resolves with the widget ID.
    newVerifier.render();

    // Cleanup on unmount
    return () => {
      newVerifier.clear();
    };
  }, [auth, containerId]);

  return verifier;
}
