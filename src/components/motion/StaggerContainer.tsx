'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number; // ms interval between items
  className?: string;
}

export default function StaggerContainer({
  children,
  staggerDelay = 60,
  className = '',
  ...props
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();

  // Inject stagger index into valid children
  const childrenWithStagger = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    // If reduced motion, no delay
    const delay = prefersReduced ? 0 : index * staggerDelay;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingStyle = (child.props as any).style || {};

    return React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
      style: {
        ...existingStyle,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      },
    });
  });

  return (
    <div className={className} {...props}>
      {childrenWithStagger}
    </div>
  );
}
