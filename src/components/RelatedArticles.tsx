"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { articlesApi, categoriesApi } from "../app/lib/api";
import { AllArticles } from "../app/types/Articles";
import ArticleImage from "./ArticleImage";

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
  const [relatedArticles, setRelatedArticles] = useState<AllArticles[]>([]);
  const [categorySlugById, setCategorySlugById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        const [allArticles, allCategories] = await Promise.all([
          articlesApi.getAll(),
          categoriesApi.getAll(),
        ]);

        const slugMap = (Array.isArray(allCategories) ? allCategories : []).reduce(
          (acc, category) => {
            if (category?.id && category?.categorySlug) {
              acc[category.id] = category.categorySlug;
            }
            return acc;
          },
          {} as Record<number, string>
        );
        setCategorySlugById(slugMap);
        
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
    return date.toLocaleString('ar-SA-u-hc-h23', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      numberingSystem: 'arab'
    });
  };

  const getArticleHref = (article: AllArticles) => {
    const categorySlug = categorySlugById[article.categoryId];
    if (categorySlug) {
      return `/${categorySlug}/${article.id}`;
    }
    return `/article/${article.id}`;
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
      <div className="divide-y divide-gray-100">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={getArticleHref(article)}
            className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 transition-colors group"
            dir="rtl"
          >
            {/* Image — always on the right */}
            <div className="relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <ArticleImage
                src={article.imagePath || undefined}
                alt={article.articleTitle || "مقال"}
                className="object-cover"
                fallbackElement={
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">صورة</span>
                  </div>
                }
              />
            </div>

            {/* Text Content — title + date stacked, right-aligned */}
            <div className="flex-1 flex flex-col gap-1 text-right">
              <h4 className="text-sm font-bold text-gray-800 leading-5 line-clamp-2 group-hover:text-primaryOther transition-colors">
                {article.articleTitle?.trim() || "مقال بدون عنوان"}
              </h4>
              <div className="text-xs text-gray-400 flex flex-col items-end gap-0.5">
                <span>تاريخ النشر: {formatDate(article.createdDate)}</span>
                <span>آخر تحديث: {formatDate(article.updatedDate)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
