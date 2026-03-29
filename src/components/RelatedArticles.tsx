"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { articlesApi } from "../app/lib/api";
import { getImageUrl } from "../app/lib/imageUtils";
import { AllArticles } from "../app/types/Articles";

interface RelatedArticlesProps {
  currentArticleId: string;
  tagId?: number;
  categoryId: number;
  className?: string;
}

const RelatedArticles = ({ 
  currentArticleId, 
  tagId, 
  categoryId,
  className = "" 
}: RelatedArticlesProps) => {
  const router = useRouter();
  const [relatedArticles, setRelatedArticles] = useState<AllArticles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await articlesApi.getAll();
        
        // Filter articles: same tag or same category, exclude current article
        const filtered = allArticles.filter((article: AllArticles) => 
          article.id !== currentArticleId && 
          article.isPublished &&
          (
            (tagId && article.tagId === tagId) || 
            article.categoryId === categoryId
          )
        );

        // Prioritize articles with same tag
        if (tagId) {
          filtered.sort((a, b) => {
            if (a.tagId === tagId && b.tagId !== tagId) return -1;
            if (a.tagId !== tagId && b.tagId === tagId) return 1;
            return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
          });
        } else {
          // Sort by date if no tag
          filtered.sort((a, b) => 
            new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
          );
        }

        // Take only 5 articles
        setRelatedArticles(filtered.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch related articles:", error);
        setRelatedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [currentArticleId, tagId, categoryId]);

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      numberingSystem: 'arab'
    });
  };

  const handleArticleClick = (article: AllArticles) => {
    // Navigate to article using category slug and article id
    const categorySlug = article.categoryId; // You might need to fetch category data for proper slug
    router.push(`/category/${categorySlug}/article/${article.id}`);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`} dir="rtl">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
          مواضيع ذات صلة
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`} dir="rtl">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
        مواضيع ذات صلة
      </h3>
      <div className="space-y-4">
        {relatedArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article)}
            className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
          >
            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Date */}
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <span>🕐</span>
                <span>{formatDate(article.updatedDate)}</span>
              </div>
              
              {/* Title */}
              <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors">
                {article.articleTitle}
              </h4>
            </div>

            {/* Image */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              {article.imagePath ? (
                <Image
                  src={getImageUrl(article.imagePath) || article.imagePath}
                  alt={article.articleTitle}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">لا توجد صورة</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
