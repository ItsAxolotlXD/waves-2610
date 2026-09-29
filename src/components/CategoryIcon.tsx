import React from 'react';

interface CategoryIconProps {
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  className = 'w-6 h-6 sm:w-7 sm:h-7 shrink-0',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="vplay-cat-inverted-triangle-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FF1E27" />
          <stop offset="50%" stopColor="#FF4A00" />
          <stop offset="100%" stopColor="#FF8800" />
        </linearGradient>
      </defs>
      {/* Tam giác ngược to rõ, có lỗ tam giác bên trong (hollow inverted triangle) */}
      <path
        d="M 2.2 3.6 H 21.8 L 12 21.6 Z"
        stroke="url(#vplay-cat-inverted-triangle-grad)"
        strokeWidth="3.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
