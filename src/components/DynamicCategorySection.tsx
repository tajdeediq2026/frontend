import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { encodeImageUrl } from "../app/lib/imageUtils";
import { useArticleRotation } from "../hooks/useArticleRotation";

export type Article = {
  id: string;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  imagePath: string;
  createdDate: string;
  updatedDate: string;
  isPublished: boolean;
  categoryId: number;
};

export type CategoryWithArticles = {
  id: number;
  name: string;
  categorySlug: string;
  isActivated: boolean;
  articles: Article[];
};

interface DynamicCategorySectionProps {
  category: CategoryWithArticles;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
  isCategoryPage?: boolean;
}

const DynamicCategorySection = ({ 
  category, 
  showHeader = true,
  showViewAll = true,
  className = "",
  isCategoryPage = false
}: DynamicCategorySectionProps) => {
  // Use the article rotation hook for automatic rotation
  const {
    isRotating,
    getRotationClass,
    isNewArticle,
    positions
  } = useArticleRotation({
    articles: category.articles,
    categoryId: category.id,
    maxArticles: 5
  });
  
  if (!category.articles || category.articles.length === 0) {
    return null;
  }

  const rootSpacingClass = isCategoryPage ? "mb-0" : "mb-8";
  const contentPaddingClass = isCategoryPage ? "p-0" : "p-3 sm:p-4 md:p-6";
  const dynamicGridClass = isCategoryPage
    ? "flex flex-col lg:grid lg:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2 lg:h-[520px]"
    : "flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 lg:h-[400px]";
  const bigContainerClass = isCategoryPage
    ? "relative h-[270px] sm:h-[330px] lg:h-full lg:col-span-2 rounded-lg overflow-hidden"
    : "relative h-[200px] sm:h-[250px] lg:h-full lg:col-span-2 rounded-lg overflow-hidden";
  const smallGridClass = isCategoryPage ? "grid grid-cols-2 gap-1 sm:gap-1.5" : "grid grid-cols-2 gap-2 sm:gap-3";
  const smallContainerClass = isCategoryPage
    ? "relative h-[160px] sm:h-[200px] lg:h-auto rounded-lg overflow-hidden"
    : "relative h-[120px] sm:h-[150px] lg:h-auto rounded-lg overflow-hidden";

  return (
    <div className={`bg-white rounded-lg category-card overflow-hidden ${rootSpacingClass} ${className}`} dir="rtl">
      {/* Category Header */}
      {showHeader && (
        <div className="bg-primaryOther px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-bold text-lg sm:text-xl category-title">{category.name}</h2>
            {showViewAll && (
              <Link 
                href={`/category/${category.categorySlug}`}
                className="text-white text-sm hover:underline flex items-center"
              >
                المزيد
                <span className="mr-2 text-xs">←</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Layout with Rotation Animation */}
      <div className={contentPaddingClass}>
        <div className={dynamicGridClass}>
          {/* Big Image on the right */}
          <div className={`${bigContainerClass} ${getRotationClass('big')}`}>
            {positions.big && (
              <BigArticleCard 
                article={positions.big} 
                isAnimating={isRotating}
                isNew={isNewArticle(positions.big.id)}
              />
            )}
          </div>
          {/* Four Small Images on the left */}
          <div className={smallGridClass}>
            {/* Top-Right Position */}
            {positions.topRight && (
              <div className={`${smallContainerClass} ${getRotationClass('top-right')}`}>
                <SmallArticleCard 
                  article={positions.topRight}
                  isAnimating={isRotating}
                  position="top-right"
                />
              </div>
            )}
            {/* Top-Left Position */}
            {positions.topLeft && (
              <div className={`${smallContainerClass} ${getRotationClass('top-left')}`}>
                <SmallArticleCard 
                  article={positions.topLeft}
                  isAnimating={isRotating}
                  position="top-left"
                />
              </div>
            )}
            {/* Bottom-Left Position */}
            {positions.bottomLeft && (
              <div className={`${smallContainerClass} ${getRotationClass('bottom-left')}`}>
                <SmallArticleCard 
                  article={positions.bottomLeft}
                  isAnimating={isRotating}
                  position="bottom-left"
                />
              </div>
            )}
            {/* Bottom-Right Position */}
            {positions.bottomRight && (
              <div className={`${smallContainerClass} ${getRotationClass('bottom-right')}`}>
                <SmallArticleCard 
                  article={positions.bottomRight}
                  isAnimating={isRotating}
                  position="bottom-right"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Big Article Card (Right Side)
interface BigArticleCardProps {
  article: Article;
  isAnimating?: boolean;
  isNew?: boolean;
}

const BigArticleCard = ({ article, isAnimating = false, isNew = false }: BigArticleCardProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isBlob, setIsBlob] = useState(false);
  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchImage = async () => {
      if (!article.imagePath) {
        console.log('BigArticle - No image path provided');
        return;
      }
      
      console.log('BigArticle - Fetching image:', article.imagePath);
      
      if (article.imagePath.includes('localhost:7065') || article.imagePath.includes('/uploads/')) {
        try {
          let fullUrl = article.imagePath;
          if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = `https://tajdeediq-001-site1.stempurl.com${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
          }
          fullUrl = fullUrl.replace(/https?:\/\/localhost:7065/g, 'https://tajdeediq-001-site1.stempurl.com');
          const encodedUrl = encodeImageUrl(fullUrl);
          setImgSrc(encodedUrl);
          setIsBlob(false);
        } catch (error) {
          console.error('BigArticle - Image URL error:', error);
        }
      } else if (/^https?:\/\//.test(article.imagePath)) {
        setImgSrc(article.imagePath);
        setIsBlob(false);
      }
    };
    fetchImage();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        console.log('BigArticle - Object URL revoked');
      }
    };
  }, [article.imagePath]);

  if (!imgSrc) {
    return (
      <div className="relative h-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primaryOther mb-2"></div>
          <p className="text-sm text-gray-500">جاري تحميل الصورة...</p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className="group h-full block">
      <div className={`relative h-full rounded-lg overflow-hidden ${isAnimating ? 'article-rotation-animation' : ''}`}>
        <Image
          src={imgSrc}
          alt={article.articleTitle}
          fill
          className="object-cover w-full h-full absolute inset-0 scale-110 group-hover:scale-115 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized={isBlob}
        />
        {/* Light overlay for text contrast only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 z-20">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl line-clamp-2 leading-tight text-white font-bold article-title-shadow">
            {article.articleTitle}
          </h3>
          {isNew && (
            <div className="absolute -top-2 -right-2">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-white text-xs">🆕</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Small Article Card (Left Side Grid)
interface SmallArticleCardProps {
  article: Article;
  isAnimating?: boolean;
  position?: string;
}

const SmallArticleCard = ({ article, isAnimating = false, position = '' }: SmallArticleCardProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isBlob, setIsBlob] = useState(false);
  
  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchImage = async () => {
      if (!article.imagePath) {
        console.log('SmallArticle - No image path provided');
        return;
      }
      
      console.log('SmallArticle - Fetching image:', article.imagePath);
      
      if (article.imagePath.includes('localhost:7065') || article.imagePath.includes('/uploads/')) {
        try {
          let fullUrl = article.imagePath;
          if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = `https://tajdeediq-001-site1.stempurl.com${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
          }
          fullUrl = fullUrl.replace(/https?:\/\/localhost:7065/g, 'https://tajdeediq-001-site1.stempurl.com');
          const encodedUrl = encodeImageUrl(fullUrl);
          setImgSrc(encodedUrl);
          setIsBlob(false);
        } catch (error) {
          console.error('SmallArticle - Image URL error:', error);
        }
      } else if (/^https?:\/\//.test(article.imagePath)) {
        setImgSrc(article.imagePath);
        setIsBlob(false);
      }
    };
    fetchImage();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        console.log('SmallArticle - Object URL revoked');
      }
    };
  }, [article.imagePath]);

  if (!imgSrc) {
    return (
      <div className="relative h-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primaryOther mb-1"></div>
          <p className="text-xs text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className="group h-full block">
      <div className={`relative h-full rounded-lg overflow-hidden ${isAnimating ? `article-rotation-animation rotation-${position}` : ''}`}>
        <Image
          src={imgSrc}
          alt={article.articleTitle}
          fill
          className={`object-cover w-full h-full absolute inset-0 scale-110 group-hover:scale-115 transition-transform duration-300`}
          sizes="(max-width: 768px) 100vw, 25vw"
          unoptimized={isBlob}
        />
        {/* Light overlay for text contrast only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-20">
          <h4 className="text-xs sm:text-sm md:text-base line-clamp-2 leading-tight text-white font-bold article-title-shadow">
            {article.articleTitle}
          </h4>
          {isAnimating && (
            <div className="absolute -top-1 -right-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DynamicCategorySection;
