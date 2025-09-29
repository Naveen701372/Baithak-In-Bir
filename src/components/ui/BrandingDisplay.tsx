'use client'

import React from 'react'
import { useBranding } from '@/contexts/BrandingContext'

interface BrandingDisplayProps {
    className?: string
    logoClassName?: string
    textClassName?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showTagline?: boolean
}

const sizeStyles = {
    sm: {
        logo: 'w-6 h-6',
        text: 'text-sm font-medium',
        tagline: 'text-xs'
    },
    md: {
        logo: 'w-8 h-8',
        text: 'text-lg font-semibold',
        tagline: 'text-sm'
    },
    lg: {
        logo: 'w-12 h-12',
        text: 'text-xl font-bold',
        tagline: 'text-base'
    },
    xl: {
        logo: 'w-16 h-16',
        text: 'text-2xl font-bold',
        tagline: 'text-lg'
    }
}

export default function BrandingDisplay({
    className = '',
    logoClassName = '',
    textClassName = '',
    size = 'md',
    showTagline = false
}: BrandingDisplayProps) {
    const { branding, loading } = useBranding()

    if (loading) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className={`bg-gray-200 rounded animate-pulse ${sizeStyles[size].logo}`}></div>
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    {showTagline && <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>}
                </div>
            </div>
        )
    }

    const showLogo = (branding.display === 'logo' || branding.display === 'both') && branding.logo
    const showText = branding.display === 'text' || branding.display === 'both'

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showLogo && (
                <div className={`overflow-hidden rounded ${sizeStyles[size].logo} ${logoClassName}`}>
                    <img
                        src={branding.logo}
                        alt={`${branding.name} logo`}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {showText && (
                <div className="flex flex-col">
                    <span
                        className={`${sizeStyles[size].text} ${textClassName}`}
                        style={{ color: branding.colors.text }}
                    >
                        {branding.name}
                    </span>
                    {showTagline && branding.tagline && (
                        <span
                            className={`${sizeStyles[size].tagline} opacity-75`}
                            style={{ color: branding.colors.text }}
                        >
                            {branding.tagline}
                        </span>
                    )}
                </div>
            )}

            {/* Fallback when no valid display option is available */}
            {!showLogo && !showText && (
                <span
                    className={`${sizeStyles[size].text} ${textClassName}`}
                    style={{ color: branding.colors.text }}
                >
                    {branding.name}
                </span>
            )}
        </div>
    )
}

// Helper hook for conditional branding display logic
export function useBrandingDisplay() {
    const { branding } = useBranding()

    return {
        shouldShowLogo: (branding.display === 'logo' || branding.display === 'both') && !!branding.logo,
        shouldShowText: branding.display === 'text' || branding.display === 'both',
        branding
    }
}
