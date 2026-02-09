"use client";
import Link from "next/link";
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
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.log('Social media data fetched:', data);
        
        // Filter only activated social media
        const activeSocialMedias = data.filter((sm: SocialMedia) => sm.isActivated);
        console.log('Active social medias:', activeSocialMedias);
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
      {socialMedias.map((socialMedia) => (
        <Link
          key={socialMedia.socialMediaId}
          href={socialMedia.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${variant === 'footer' ? 'bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all hover:scale-110' : 'hover:opacity-75 transition-opacity'}`}
          title={socialMedia.iconName}
        >
          {socialMedia.imagePath ? (
            <img
              src={`https://tajdeediq-001-site1.stempurl.com${socialMedia.imagePath}`}
              alt={socialMedia.iconName}
              width={iconSize}
              height={iconSize}
              className={`${variant === 'footer' ? 'w-8 h-8' : `w-${iconSize === 40 ? '10' : '8'} h-${iconSize === 40 ? '10' : '8'}`} object-cover rounded`}
              onError={(e) => {
                console.error(`Failed to load image: ${socialMedia.imagePath}`);
                // Hide the image and show fallback
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
              onLoad={() => {
                console.log(`Successfully loaded image: ${socialMedia.imagePath}`);
              }}
            />
          ) : null}
          <div 
            className={`fallback-icon w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm ${socialMedia.imagePath ? 'hidden' : 'flex'}`}
          >
            {socialMedia.iconName.charAt(0).toUpperCase()}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default SocialMediaIcons;