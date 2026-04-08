"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { articlesApi } from "../lib/api";
import { AllArticles } from "../types/Articles";
import ArticleImage from "../../components/ArticleImage";
import { SearchIcon } from "../../components/UiIcons";

// Strip HTML tags from content for display
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

// Highlight matched text
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// Get a snippet of content around the matched query
const getContentSnippet = (content: string, query: string, maxLen = 200): string => {
  const plain = stripHtml(content);
  if (!query) return plain.slice(0, maxLen);
  const lowerPlain = plain.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerPlain.indexOf(lowerQuery);
  if (idx === -1) return plain.slice(0, maxLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(plain.length, idx + query.length + 140);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plain.length) snippet = snippet + "...";
  return snippet;
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";
  const [results, setResults] = useState<AllArticles[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    setSearchQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const data = await articlesApi.search(q.trim());
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" dir="rtl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">نتائج البحث</h1>
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المقالات..."
              className="w-full pr-12 pl-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primaryOther focus:outline-none transition-colors text-right text-black"
              dir="rtl"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primaryOther text-white rounded-lg hover:bg-primaryOther-dark transition-colors text-sm font-medium"
            >
              بحث
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primaryOther rounded-full animate-spin" />
          <span className="mr-3 text-gray-500 text-lg">جارٍ البحث...</span>
        </div>
      )}

      {/* No Results */}
      {!loading && q && results.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon className="text-7xl w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-2xl font-bold text-gray-700 mb-2">لا توجد نتائج</p>
          <p className="text-gray-500">
            لم نجد مقالات تتطابق مع &quot;{q}&quot;
          </p>
          <p className="text-gray-400 text-sm mt-2">حاول البحث بكلمات مختلفة أو أقصر</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <p className="text-gray-500 mb-6">
            تم العثور على <span className="font-bold text-gray-700">{results.length}</span> نتيجة
            {q && (
              <>
                {" "}للبحث عن &quot;<span className="font-bold text-gray-700">{q}</span>&quot;
              </>
            )}
          </p>

          <div className="space-y-4">
            {results.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all overflow-hidden group"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  {article.imagePath && (
                    <div className="w-32 h-24 md:w-40 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <ArticleImage
                        src={article.imagePath}
                        alt={article.articleTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackElement={
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-2xl">📰</span>
                          </div>
                        }
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primaryOther transition-colors line-clamp-2 mb-2">
                      {highlightMatch(article.articleTitle, q)}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 line-clamp-2 leading-5 md:leading-6 min-h-10 md:min-h-12 overflow-hidden">
                      {highlightMatch(
                        getContentSnippet(
                          article.articleSummary || article.articleContent,
                          q
                        ),
                        q
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      {article.createdDate && (
                        <span>
                          {new Date(article.createdDate).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State (no query) */}
      {!loading && !q && (
        <div className="text-center py-16">
          <SearchIcon className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <p className="text-xl text-gray-500">اكتب كلمة للبحث في المقالات</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primaryOther rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">جارٍ التحميل...</p>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
