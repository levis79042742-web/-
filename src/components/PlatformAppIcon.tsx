import React from 'react';
import { SocialPlatform } from '../types/trend';

interface PlatformAppIconProps {
  platform: SocialPlatform;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PlatformAppIconProps['size']>, string> = {
  xs: 'w-4 h-4 rounded-[5px]',
  sm: 'w-5 h-5 rounded-[6px]',
  md: 'w-8 h-8 rounded-[10px]',
  lg: 'w-11 h-11 rounded-[13px]',
};

export const PlatformAppIcon: React.FC<PlatformAppIconProps> = ({
  platform,
  size = 'md',
  className = '',
}) => {
  const boxClass = `${SIZE_CLASSES[size]} inline-flex items-center justify-center shrink-0 select-none overflow-hidden shadow-sm ${className}`;

  switch (platform) {
    case 'instagram':
      return (
        <span
          className={boxClass}
          style={{
            background:
              'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          }}
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" className="w-[64%] h-[64%]" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5.2" stroke="#FFFFFF" strokeWidth="2.1" />
            <circle cx="12" cy="12" r="4.1" stroke="#FFFFFF" strokeWidth="2.1" />
            <circle cx="17.3" cy="6.7" r="1.25" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case 'facebook':
      return (
        <span
          className={boxClass}
          style={{ backgroundColor: '#1877F2' }}
          aria-label="Facebook"
        >
          <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none" aria-hidden="true">
            <path
              d="M15.8 13.5l.55-3.55h-3.4V7.65c0-.97.48-1.92 2-1.92h1.55V2.7s-1.4-.24-2.75-.24c-2.81 0-4.65 1.7-4.65 4.79v2.7H6.05v3.55H9.1v8.6h3.85v-8.6h2.85z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'youtube':
      return (
        <span
          className={boxClass}
          style={{ backgroundColor: '#FF0000' }}
          aria-label="YouTube"
        >
          <svg viewBox="0 0 24 24" className="w-[68%] h-[68%]" fill="none" aria-hidden="true">
            <path
              d="M9.75 7.25v9.5L17.5 12 9.75 7.25z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'tiktok':
      return (
        <span
          className={`${boxClass} border border-white/15`}
          style={{ backgroundColor: '#0B0B10' }}
          aria-label="TikTok"
        >
          <svg viewBox="0 0 24 24" className="w-[64%] h-[64%]" fill="none" aria-hidden="true">
            <path
              d="M16.6 5.82A4.28 4.28 0 0114.95 3h-3.1v11.6a2.6 2.6 0 11-1.88-2.5V8.96a5.75 5.75 0 105.03 5.7V8.86a7.34 7.34 0 004.3 1.38V7.16a4.28 4.28 0 01-2.7-1.34z"
              fill="#25F4EE"
              transform="translate(-0.7, -0.5)"
            />
            <path
              d="M16.6 5.82A4.28 4.28 0 0114.95 3h-3.1v11.6a2.6 2.6 0 11-1.88-2.5V8.96a5.75 5.75 0 105.03 5.7V8.86a7.34 7.34 0 004.3 1.38V7.16a4.28 4.28 0 01-2.7-1.34z"
              fill="#FE2C55"
              transform="translate(0.7, 0.5)"
            />
            <path
              d="M16.6 5.82A4.28 4.28 0 0114.95 3h-3.1v11.6a2.6 2.6 0 11-1.88-2.5V8.96a5.75 5.75 0 105.03 5.7V8.86a7.34 7.34 0 004.3 1.38V7.16a4.28 4.28 0 01-2.7-1.34z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'xiaohongshu':
      return (
        <span
          className={boxClass}
          style={{ backgroundColor: '#FF2442' }}
          aria-label="小紅書"
        >
          <svg viewBox="0 0 24 24" className="w-[78%] h-[78%]" fill="none" aria-hidden="true">
            <text
              x="12"
              y="15.2"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7.4"
              fontWeight="800"
              fontFamily="'Noto Sans TC', sans-serif"
            >
              小紅書
            </text>
          </svg>
        </span>
      );

    case 'threads':
      return (
        <span
          className={`${boxClass} border border-white/15`}
          style={{ backgroundColor: '#121216' }}
          aria-label="Threads"
        >
          <svg viewBox="0 0 24 24" className="w-[62%] h-[62%]" fill="none" aria-hidden="true">
            <path
              d="M15.9 11.4c-.16-2.55-1.6-4.1-4.1-4.1-1.56 0-2.85.64-3.6 1.78l1.68 1.15c.47-.72 1.2-1.08 2.02-1.08 1.24 0 1.98.66 2.13 1.88-.82-.17-1.72-.21-2.66-.07-2.25.33-3.57 1.66-3.42 3.45.14 1.64 1.46 2.79 3.24 2.79 1.32 0 2.38-.52 3-1.46.41-.62.66-1.42.73-2.42.8.48 1.3 1.22 1.3 2.18 0 1.84-1.58 3.2-4.12 3.2-2.96 0-4.9-1.95-4.9-5.08 0-3.16 1.96-5.22 4.95-5.22 2.4 0 4.02 1.16 4.55 3.16l1.86-.48C17.8 7.5 15.42 5.75 12.15 5.75 7.95 5.75 5.1 8.7 5.1 13.02c0 4.3 2.84 7.23 7.05 7.23 3.7 0 6.15-2.22 6.15-5.28 0-1.76-.88-3.04-2.4-3.57zm-3.68 4.02c-.98 0-1.64-.48-1.72-1.2-.08-.77.52-1.39 1.67-1.56.65-.1 1.28-.08 1.84.05-.1 1.72-.82 2.71-1.79 2.71z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );
  }
};
