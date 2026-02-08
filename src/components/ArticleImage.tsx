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
  const [imageLoading, setImageLoading] = useState(true);

  // Check if we have a valid image source
  const hasValidSrc = src && src.trim() && !imageError;

  // Normalize image path using centralized utility
  const normalizedSrc = hasValidSrc ? normalizeImagePath(src.trim()) : '';

  // Default fallback
  const defaultFallback = (
    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-white text-center p-8">
        <div className="text-4xl mb-4">📰</div>
        <p className="text-lg">مقال مميز جيد</p>
      </div>
    </div>
  );




  if (!hasValidSrc) {
    console.log('ArticleImage: Showing fallback due to invalid src');
    return fallbackElement || defaultFallback;
  }

  console.log('=== RENDERING IMAGE ===');
  console.log('Using normalized src:', normalizedSrc);
  console.log('hasValidSrc:', hasValidSrc);
  console.log('imageError:', imageError);
  console.log('imageLoading:', imageLoading);

  return (
    <div className="relative w-full h-full">
      {/* Show fallback while loading or if error */}
      {(imageLoading || imageError) && (
        <div className="absolute inset-0 z-10">
          {fallbackElement || defaultFallback}
        </div>
      )}
      {/* Use Next.js Image component for optimization */}
      {!imageError && (
        <>
          <Image
            src={normalizedSrc}
            alt={alt}
            className={`${className} absolute inset-0 w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 z-20`}
            fill
            sizes="100vw"
            onError={(e) => {
              console.error('=== IMAGE LOADING ERROR ===');
              console.error('Original src:', src);
              console.error('Normalized path:', normalizedSrc);
              console.error('Backend URL from env:', process.env.NEXT_PUBLIC_API_URL);
              console.error('hasValidSrc:', hasValidSrc);
              console.error('Type of src:', typeof src);
              console.error('Error event:', e);
              console.error('================================');
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => {
              console.log('=== IMAGE LOADED SUCCESSFULLY ===');
              console.log('Loaded image:', normalizedSrc);
              setImageLoading(false);
            }}
            unoptimized // Remove this line if you want Next.js to optimize remote images
          />
        </>
      )}
    </div>
  );
};

export default ArticleImage;
