"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoSearch, IoClose } from "react-icons/io5";
import Link from "next/link";
import { articlesApi } from "../app/lib/api";
import { AllArticles } from "../app/types/Articles";
import ArticleImage from "./ArticleImage";

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
const getContentSnippet = (content: string, query: string, maxLen = 120): string => {
  const plain = stripHtml(content);
  if (!query) return plain.slice(0, maxLen);
  const lowerPlain = plain.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerPlain.indexOf(lowerQuery);
  if (idx === -1) return plain.slice(0, maxLen);
  const start = Math.max(0, idx - 40);
  const end = Math.min(plain.length, idx + query.length + 80);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plain.length) snippet = snippet + "...";
  return snippet;
};

const SearchComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AllArticles[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await articlesApi.search(searchQuery.trim());
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setHasSearched(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Toggle Button */}
      <button
        onClick={toggleSearch}
        className="flex items-center gap-1 px-3 py-2 text-white hover:bg-white/20 rounded transition-colors"
        aria-label="بحث"
        title="بحث"
      >
        <IoSearch className="text-xl" />
        <span className="hidden sm:inline text-sm">بحث</span>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Search Panel */}
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl animate-slideDown">
          <div className="container mx-auto px-4 py-4">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <IoSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في المقالات..."
                  className="w-full pr-12 pl-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primaryOther focus:outline-none transition-colors text-right text-black"
                  dir="rtl"
                />
              </div>
              <button
                type="button"
                onClick={toggleSearch}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="إغلاق"
              >
                <IoClose className="text-2xl" />
              </button>
            </form>

            {/* Results Dropdown */}
            <div className="mt-3 max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-primaryOther rounded-full animate-spin" />
                  <span className="mr-3 text-gray-500">جارٍ البحث...</span>
                </div>
              )}

              {!loading && hasSearched && results.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <IoSearch className="text-5xl mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد نتائج</p>
                  <p className="text-sm mt-1">حاول البحث بكلمات مختلفة</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-2 text-right">
                    {results.length} نتيجة
                  </p>
                  {results.slice(0, 8).map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.id}`}
                      onClick={handleResultClick}
                      className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
                    >
                      {/* Image */}
                      {article.imagePath && (
                        <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <ArticleImage
                            src={article.imagePath}
                            alt={article.articleTitle}
                            className="w-full h-full object-cover"
                            fallbackElement={
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-400">📰</span>
                              </div>
                            }
                          />
                        </div>
                      )}
                      {/* Content */}
                      <div className="flex-1 min-w-0 text-right">
                        <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primaryOther transition-colors">
                          {highlightMatch(article.articleTitle, query)}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {highlightMatch(
                            getContentSnippet(
                              article.articleSummary || article.articleContent,
                              query
                            ),
                            query
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {/* View all results link */}
                  {results.length > 8 && (
                    <button
                      onClick={handleSubmit as unknown as () => void}
                      className="w-full py-3 text-center text-primaryOther font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      عرض جميع النتائج ({results.length})
                    </button>
                  )}
                </div>
              )}

              {/* Quick hint when empty */}
              {!loading && !hasSearched && (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">اكتب للبحث في عناوين ومحتوى المقالات</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SearchComponent;
