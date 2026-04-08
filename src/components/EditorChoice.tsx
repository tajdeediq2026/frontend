"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { articlesApi, categoriesApi } from "../app/lib/api";
import { AllArticles, AllCategories } from "../app/types/Articles";
import ArticleImage from "./ArticleImage";
import { useArabicDate } from "../hooks/useDateFormatting";
import { TimeIcon } from "./UiIcons";

// Individual article row component (needs hook at top level)
const EditorChoiceItem: React.FC<{
  article: AllArticles;
  category?: AllCategories;
}> = ({ article, category }) => {
  const formattedDate = useArabicDate(article.createdDate, false);

  const getArticleUrl = () => {
    if (category?.categorySlug) {
      return `/${category.categorySlug}/${article.id}`;
    }
    return `/article/${article.id}`;
  };

  return (
    <Link href={getArticleUrl()} className="block group">
      <div className="flex gap-3 items-start py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200 rounded-md px-1">
        {/* Text Content - Right side (RTL) */}
        <div className="flex-1 min-w-0 text-right">
          {/* Date */}
          <div className="flex items-center justify-start gap-1 text-gray-400 text-xs mb-1.5">
            <span>{formattedDate}</span>
            <TimeIcon className="w-3.5 h-3.5" />
          </div>
          {/* Title */}
          <h3 className="text-sm font-bold text-gray-800 leading-relaxed line-clamp-2 group-hover:text-primaryOther transition-colors duration-200">
            {article.articleTitle}
          </h3>
        </div>
        {/* Image - Left side (RTL) */}
        <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
          <ArticleImage
            src={article.imagePath}
            alt={article.articleTitle || "مقال"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </Link>
  );
};

const EditorChoice: React.FC = () => {
  const [articles, setArticles] = useState<AllArticles[]>([]);
  const [categories, setCategories] = useState<AllCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [editorArticles, cats] = await Promise.all([
          articlesApi.getEditorChoice(),
          categoriesApi.getAll(),
        ]);
        setArticles(editorArticles.slice(0, 4));
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching editor choice articles:", err);
        setError("فشل في تحميل اختيارات المحرر");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryForArticle = (article: AllArticles) => {
    return categories.find((c) => c.id === article.categoryId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-24 h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return null; // Silently hide if no editor choice articles
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="flex-1 h-0.5 bg-primaryOther"></div>
        <h2 className="text-primaryOther font-bold text-base whitespace-nowrap">
          اخترنا لك
        </h2>
      </div>

      {/* Articles list */}
      <div className="px-3 pb-3">
        {articles.map((article) => (
          <EditorChoiceItem
            key={article.id}
            article={article}
            category={getCategoryForArticle(article)}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorChoice;
