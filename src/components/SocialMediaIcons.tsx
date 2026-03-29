"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type SocialMedia = {
  socialMediaId: number;
  iconName: string;
  link: string;
  imagePath?: string;
  isActivated: boolean;
};

interface SocialMediaIconsProps {
  className?: string;
  iconSize?: number;
  variant?: 'header' | 'footer';
}

function SocialMediaIcons({ className = "", iconSize = 32, variant = 'footer' }: SocialMediaIconsProps) {
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7065').replace(/\/$/, '');
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());

  const markImageAsFailed = (id: number) => {
    setFailedImageIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchSocialMedias = async () => {
      try {
        setLoading(true);
        // Use Next.js rewrite proxy to avoid CORS in the browser
        const response = await fetch('/api/backend/SocialMedia');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter only activated social media
        const activeSocialMedias = data.filter((sm: SocialMedia) => sm.isActivated);
        setSocialMedias(activeSocialMedias);
      } catch (error) {
        console.error("Failed to fetch social medias", error);
        setSocialMedias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMedias();
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center space-x-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/10 animate-pulse p-3 rounded-lg w-12 h-12"
          />
        ))}
      </div>
    );
  }

  if (socialMedias.length === 0) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-200">لا توجد أيقونات تواصل اجتماعي متاحة</p>
      </div>
    );
  }

  return (
    <div className={`flex ${variant === 'footer' ? 'justify-center md:justify-start' : 'items-center'} ${variant === 'footer' ? 'flex-wrap gap-4' : 'gap-2'} ${className}`}>
      {socialMedias.map((socialMedia) => {
        const imageUrl = socialMedia.imagePath
          ? `${backendBase}${socialMedia.imagePath}`
          : '';
        const showImage = Boolean(imageUrl) && !failedImageIds.has(socialMedia.socialMediaId);

        return (
          <Link
            key={socialMedia.socialMediaId}
            href={socialMedia.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${variant === 'footer' ? 'bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all hover:scale-110' : 'hover:opacity-75 transition-opacity'}`}
            title={socialMedia.iconName}
          >
            {showImage ? (
              <Image
                src={imageUrl}
                alt={socialMedia.iconName}
                width={iconSize}
                height={iconSize}
                className={`${variant === 'footer' ? 'w-8 h-8' : ''} object-cover rounded`}
                onError={() => markImageAsFailed(socialMedia.socialMediaId)}
                unoptimized
              />
            ) : null}
            <div
              className={`fallback-icon w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center text-white text-sm font-bold shadow-sm ${showImage ? 'hidden' : 'flex'}`}
            >
              {socialMedia.iconName.charAt(0).toUpperCase()}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default SocialMediaIcons;