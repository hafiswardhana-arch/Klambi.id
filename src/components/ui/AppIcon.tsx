'use client';

import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type IconVariant = 'outline' | 'solid';

interface IconProps {
    name: string; // Changed to string to accept dynamic values
    variant?: IconVariant;
    size?: number;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: any;
}

function Icon({
    name,
    variant = 'outline',
    size = 24,
    className = '',
    onClick,
    disabled = false,
    ...props
}: IconProps) {
    // rem-based so icons scale with the tablet root font-size
    const rem = `${size / 16}rem`;
    const iconSet = variant === 'solid' ? HeroIconsSolid : HeroIcons;
    const IconComponent = iconSet[name as keyof typeof iconSet] as React.ComponentType<any>;

    if (!IconComponent) {
        return (
            <QuestionMarkCircleIcon
                width={rem}
                height={rem}
                className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
                onClick={disabled ? undefined : onClick}
                {...props}
            />
        );
    }

    return (
        <IconComponent
            width={rem}
            height={rem}
            className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
            onClick={disabled ? undefined : onClick}
            {...props}
        />
    );
}

export default Icon; 