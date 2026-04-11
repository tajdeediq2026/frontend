"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { normalizeImagePath } from '../app/lib/imageUtils';

interface ArticleImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackElement?: React.ReactNode;
}

const ArticleImage: React.FC<ArticleImageProps> = ({
  src,
  alt,
  className = "",
  fallbackElement
}) => {
  const [imageError, setImageError] = useState(false);

  // Check if we have a valid image source
  const hasValidSrc = Boolean(src?.trim()) && !imageError;

  // Normalize image path using centralized utility
  const normalizedSrc = hasValidSrc ? normalizeImagePath(src!.trim()) : '';

  // Default fallback
  const defaultFallback = (
    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-white text-center p-8">
        <div className="text-4xl mb-4">📰</div>
        <p className="text-lg">مقال مميز جيد</p>
      </div>
    </div>
  );




  if (!hasValidSrc || !normalizedSrc) {
    return fallbackElement || defaultFallback;
  }

  return (
    <div className="relative w-full h-full">
      {/* Use Next.js Image component for optimization */}
      {!imageError && (
        <>
          <Image
            src={normalizedSrc}
            alt={alt}
            className={`absolute inset-0 w-full h-full ${className || 'object-cover'}`}
            fill
            sizes="100vw"
            onError={() => {
              setImageError(true);
            }}
            unoptimized
          />
        </>
      )}
    </div>
  );
};

export default ArticleImage;
