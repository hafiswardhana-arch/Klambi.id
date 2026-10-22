'use client';

import React, { useState, useEffect } from 'react';

interface SignatureCircularMotionProps {
  size?: 'sm' | 'md' | 'lg';
  onAnimationComplete?: () => void;
  showCheckmark?: boolean;
  className?: string;
}

/**
 * Klámbi.id Signature Circular Motion (PRD Section 9.2)
 *
 * An animated infinity/circular motion inspired by the Klámbi.id logo.
 * Two light streams travel smoothly along the figure-8 loop path,
 * meet at the central convergence point, and morph/reveal into a success checkmark.
 *
 * Colors: Deep Blue (#123A63 / #10284D), Soft Green (#2F9E67 / #22C55E), Yellow accent (#F3D400)
 * Duration: 2.0s per loop, smooth ease-in-out
 */
export default function SignatureCircularMotion({
  size = 'md',
  onAnimationComplete,
  showCheckmark = true,
  className = '',
}: SignatureCircularMotionProps) {
  const [phase, setPhase] = useState<'looping' | 'complete'>('looping');

  const dimensions = {
    sm: { width: 80, height: 44, strokeWidth: 4 },
    md: { width: 120, height: 66, strokeWidth: 5 },
    lg: { width: 160, height: 88, strokeWidth: 6 },
  }[size];

  useEffect(() => {
    // 2.0 seconds loop, then morph into checkmark if showCheckmark is true
    const timer = setTimeout(() => {
      if (showCheckmark) {
        setPhase('complete');
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [showCheckmark, onAnimationComplete]);

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div
        style={{ width: dimensions.width, height: dimensions.height }}
        className="relative flex items-center justify-center"
      >
        {phase === 'looping' ? (
          <svg
            viewBox="0 0 160 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Gradient stream 1: Blue to Cyan to Soft Green */}
              <linearGradient id="stream-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10284D" />
                <stop offset="50%" stopColor="#3A7BF7" />
                <stop offset="100%" stopColor="#2F9E67" />
              </linearGradient>

              {/* Gradient stream 2: Yellow accent to Soft Green */}
              <linearGradient id="stream-gradient-2" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#F3D400" />
                <stop offset="50%" stopColor="#2F9E67" />
                <stop offset="100%" stopColor="#10284D" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background subtle guide path */}
            <path
              d="M44 44 C 44 24, 16 24, 16 44 C 16 64, 44 64, 80 44 C 116 24, 144 24, 144 44 C 144 64, 116 64, 80 44 Z"
              stroke="#E2E5ED"
              strokeWidth={dimensions.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            />

            {/* Glowing infinity light stream 1 (moving forward) */}
            <path
              d="M44 44 C 44 24, 16 24, 16 44 C 16 64, 44 64, 80 44 C 116 24, 144 24, 144 44 C 144 64, 116 64, 80 44 Z"
              stroke="url(#stream-gradient-1)"
              strokeWidth={dimensions.strokeWidth}
              strokeLinecap="round"
              strokeDasharray="90 260"
              filter="url(#glow)"
              className="animate-[dash_2.2s_linear_infinite]"
            />

            {/* Glowing infinity light stream 2 (trailing in reverse harmony) */}
            <path
              d="M44 44 C 44 24, 16 24, 16 44 C 16 64, 44 64, 80 44 C 116 24, 144 24, 144 44 C 144 64, 116 64, 80 44 Z"
              stroke="url(#stream-gradient-2)"
              strokeWidth={dimensions.strokeWidth - 1}
              strokeLinecap="round"
              strokeDasharray="60 290"
              className="animate-[dashReverse_2.2s_linear_infinite]"
            />

            {/* Central energy point / convergence node */}
            <circle cx="80" cy="44" r="5" fill="#2F9E67" className="animate-ping opacity-75" />
            <circle cx="80" cy="44" r="3.5" fill="#F3D400" />
          </svg>
        ) : (
          /* Checkmark Morph Completion (PRD AN-09: Checkmark reveal + scale 400-600ms) */
          <div className="flex flex-col items-center justify-center animate-checkmark-reveal">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10284D] via-[#2F9E67] to-[#22C55E] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-100">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 350;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes dashReverse {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -350;
          }
        }
      `}</style>
    </div>
  );
}
