"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import { TimeIcon } from "./UiIcons";
import { getBackendBaseUrl } from "../lib/backend-url";

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

interface LastNewsForCategoryProps {
  categoryId: number;
  className?: string;
}

const LastNewsForCategory = ({ categoryId, className = '' }: LastNewsForCategoryProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendBase = getBackendBaseUrl();
        const articlesResponse = await fetch(`${backendBase}/api/Articles/Category/${categoryId}`);
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch articles');
        }

        const articlesData: Article[] = await articlesResponse.json();

        const combinedItems = articlesData
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 5);

        setArticles(combinedItems);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setError("فشل في تحميل آخر الأخبار");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestArticles();
  }, [categoryId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md mt-8 ${className}`}>
        <div className="text-center py-8">
          <div className="text-sm text-gray-500">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md mt-8 ${className}`}>
        <div className="text-center py-8">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md mt-8 ${className}`}>
        <div className="text-center py-8">
          <div className="text-sm text-gray-500">لا توجد أخبار متاحة حالياً</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg mt-8 ${className}`}>
      <div className="p-4">
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div key={article.id}>
              <Link
                href={`/article/${article.id}`}
                className="block bg-gray-50 hover:bg-blue-50 transition-colors duration-200 p-2 rounded"
              >
                <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded">
                    <ArticleImage
                      src={article.imagePath || "/img/1.jpg"}
                      alt={article.articleTitle}
                      className="w-full h-full object-cover"
                      fallbackElement={
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">صورة</span>
                        </div>
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-right line-clamp-2 mb-1 text-gray-900 hover:text-primaryOther transition-colors">
                      {article.articleTitle}
                    </h3>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-500">
                        {new Date(article.createdDate).toLocaleDateString('en-US')}
                      </span>
                      <TimeIcon className="text-gray-500 text-xs w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Divider for all items except the last */}
              {index < articles.length - 1 && (
                <div className="border-b border-gray-200 mt-3"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LastNewsForCategory;
