import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IoTimeOutline } from "react-icons/io5";
import { getImageUrl } from "../app/lib/imageUtils";
import { AllArticles, AllCategories } from "../app/types/Articles";

interface SimpleArticleDisplayProps {
  article: AllArticles;
  category: AllCategories;
  showImage?: boolean;
  showSummary?: boolean;
  showFullContent?: boolean;
  showTags?: boolean;
  showMetadata?: boolean;
  showCategoryBadge?: boolean;
}

const SimpleArticleDisplay = ({
  article,
  category,
  showImage = true,
  showSummary = true,
  showFullContent = true,
  showTags = true,
  showMetadata = true,
  showCategoryBadge = true
}: SimpleArticleDisplayProps) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState<string>("");
  const [fontSize, setFontSize] = useState(18);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const FALLBACK_IMAGE_SVG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Crect width='100%25' height='100%25' fill='%23d1d5db'/%3E%3C/svg%3E";

  useEffect(() => {
    const normalized = getImageUrl(article.imagePath);
    setImgSrc(normalized ?? "");
  }, [article.imagePath]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      numberingSystem: 'arab'
    });
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden" dir="rtl">
      {/* Category Badge */}
      {showCategoryBadge && (
        <div className="bg-primaryOther text-white px-4 py-2">
          <span className="font-bold">{category.name}</span>
        </div>
      )}

      {/* Article Image with Title Overlay */}
      {showImage && (
        <div className="relative w-full h-64 md:h-96">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={article.articleTitle}
              className="object-cover w-full h-full"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = FALLBACK_IMAGE_SVG;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {article.articleTitle}
            </h1>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="p-6">
        {/* Metadata */}
        {showMetadata && (
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <IoTimeOutline className="text-lg" />
            {article.updatedDate !== article.createdDate && (
              <span>آخر تحديث: {formatDate(article.updatedDate)}</span>
            )}
          </div>
        )}

        {/* Summary */}
        {showSummary && article.articleSummary && (
          <div className="text-lg text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg border-r-4 border-primaryOther">
            <p className="font-semibold">{article.articleSummary}</p>
          </div>
        )}

        {/* Font Size Controls */}
        {showFullContent && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 ml-2">حجم الخط:</span>
            <button
              onClick={increaseFontSize}
              className="flex items-center justify-center w-8 h-8 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-colors font-bold"
              title="تكبير الخط"
              aria-label="تكبير الخط"
            >
              +أ
            </button>
            <button
              onClick={decreaseFontSize}
              className="flex items-center justify-center w-8 h-8 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-colors font-bold"
              title="تصغير الخط"
              aria-label="تصغير الخط"
            >
              -أ
            </button>
          </div>
        )}

        {/* Full Content */}
        {showFullContent && (
          <div 
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: article.articleContent }}
          />
        )}

        {/* Tags */}
        {showTags && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {/* Category Tag */}
              <button 
                onClick={() => router.push(`/${category.categorySlug}`)}
                className="inline-block bg-primaryOther/10 text-primaryOther px-3 py-1 rounded-full text-sm font-medium hover:bg-primaryOther hover:text-white transition-colors duration-200 cursor-pointer"
                title={`عرض المزيد من مقالات ${category.name}`}
              >
                {category.name}
              </button>
              
              {/* Article Tag */}
              {article.tagName && article.tagId && (
                <button 
                  onClick={() => router.push(`/tag/${article.tagId}`)}
                  className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-600 hover:text-white transition-colors duration-200 cursor-pointer"
                  title={`عرض المزيد من مقالات وسم ${article.tagName}`}
                >
                  {article.tagName}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default SimpleArticleDisplay;