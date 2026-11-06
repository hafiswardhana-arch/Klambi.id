'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface AnimatedPresenceProps {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
  enterClassName?: string;
  exitClassName?: string;
  initialClassName?: string;
  className?: string;
  unmountOnExit?: boolean;
}

/**
 * AnimatedPresence handles smooth enter/exit animations without external libraries.
 * Keeps DOM element mounted while exit animation plays, then removes it or hides it.
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
  show,
  children,
  duration = 250,
  enterClassName = 'opacity-100 scale-100 translate-y-0',
  exitClassName = 'opacity-0 scale-95 translate-y-2 pointer-events-none',
  initialClassName = 'opacity-0 scale-95 translate-y-2',
  className = '',
  unmountOnExit = true,
}) => {
  const prefersReduced = useReducedMotion();
  const effectiveDuration = prefersReduced ? 0 : duration;
  const [shouldRender, setShouldRender] = useState(show);
  const [animClass, setAnimClass] = useState(show ? enterClassName : initialClassName);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (show) {
      setShouldRender(true);
      // Next tick apply enter classes for smooth transition
      const enterTimer = setTimeout(() => {
        setAnimClass(enterClassName);
      }, 20);
      return () => clearTimeout(enterTimer);
    } else {
      setAnimClass(exitClassName);
      if (unmountOnExit) {
        timerRef.current = setTimeout(() => {
          setShouldRender(false);
        }, effectiveDuration);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, effectiveDuration, enterClassName, exitClassName, initialClassName, unmountOnExit]);

  if (!shouldRender && unmountOnExit) {
    return null;
  }

  return (
    <div
      className={`transition-all ${animClass} ${className}`}
      style={{
        transitionDuration: prefersReduced ? '0ms' : `${effectiveDuration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedPresence;
