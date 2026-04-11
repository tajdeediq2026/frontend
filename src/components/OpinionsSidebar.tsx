"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { encodeImageUrl } from "../app/lib/imageUtils";
import { formatDateArabic } from "../app/lib/hijriUtils";

interface OpinionArticle {
  id: string;
  articleTitle: string;
  articleSummary: string;
  imagePath: string;
  createdDate: string;
  authorName?: string;
}

interface OpinionsSidebarProps {
  className?: string;
}

const OpinionsSidebar = ({ className = "" }: OpinionsSidebarProps) => {
  const [articles, setArticles] = useState<OpinionArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/author-articles?opinionsCategoryId=11");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const sorted = (Array.isArray(data) ? data : [])
          .sort(
            (a: OpinionArticle, b: OpinionArticle) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime()
          )
          .slice(0, 5);
        setArticles(sorted);
      } catch {
        setError("فشل في تحميل المقالات");
      } finally {
        setLoading(false);
      }
    };
    fetchOpinions();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-center py-3 px-4 border-b border-gray-100">
        <div className="w-10 h-1 bg-primaryOther rounded-sm"></div>
        <Link
          href="/opinions"
          className="text-primaryOther font-bold text-sm mx-2 hover:underline article-title-font"
        >
          مقالات الرأي
        </Link>
        <div className="w-10 h-1 bg-primaryOther rounded-sm"></div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center py-6 text-sm text-gray-400">
            جاري التحميل...
          </div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-red-400">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            لا توجد مقالات متاحة
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article, index) => (
              <div key={article.id}>
                <Link
                  href={`/opinions/${article.id}`}
                  className="flex gap-3 items-start hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                  dir="rtl"
                >
                  {/* Thumbnail */}
                  {article.imagePath && (
                    <div className="flex-shrink-0 w-16 h-16 relative rounded overflow-hidden">
                      <Image
                        src={encodeImageUrl(article.imagePath)}
                        alt={article.articleTitle}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                  )}
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 text-right article-title-font">
                      {article.articleTitle}
                    </p>
                    {article.authorName && (
                      <p className="text-xs text-primaryOther mt-1 text-right">
                        {article.authorName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {formatDateArabic(new Date(article.createdDate), {
                        showHijri: false,
                        showGregorian: true,
                      })}
                    </p>
                  </div>
                </Link>
                {index < articles.length - 1 && (
                  <div className="border-b border-gray-100 mt-1"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default OpinionsSidebar;
