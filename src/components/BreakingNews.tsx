"use client";
import { useEffect, useState } from "react";

type BreakingNewsItem = {
  id: number;
  title: string;
  breakingNewsDuration: string;
  createdAt: string;
  isPublished: boolean;
};

const BreakingNews = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/breaking-news');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Breaking news data fetched:', data);
        
        // Filter only published breaking news
        const publishedNews = data.filter((news: BreakingNewsItem) => news.isPublished);
        setBreakingNews(publishedNews);
      } catch (error) {
        console.error("Failed to fetch breaking news", error);
        setBreakingNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  // Auto-rotate breaking news items
  useEffect(() => {
    if (breakingNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === breakingNews.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [breakingNews.length]);

  // Don't show loading state or empty state
  if (loading || !breakingNews || breakingNews.length === 0 || !isVisible) {
    return null;
  }

  const currentNews = breakingNews[currentIndex];

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="container mx-auto bg-red-600 text-white py-2 border-b-2 border-red-700 animate-scale-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <span className="bg-white text-red-600 px-4 py-2 text-sm font-bold rounded-sm ml-2 flex-shrink-0">
              أخبار عاجلة
            </span>
            <div className="flex-1 mx-4">
              <span className="text-sm font-normal animate-fade-in">
                {currentNews.title}
              </span>
            </div>
            {breakingNews.length > 1 && (
              <div className="flex items-center ml-2">
                <span className="text-xs opacity-75">
                  {currentIndex + 1} / {breakingNews.length}
                </span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-white hover:text-red-200 transition-colors duration-200 ml-2 p-1"
            title="إغلاق الأخبار العاجلة"
            aria-label="إغلاق الأخبار العاجلة"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in;
        }
      `}</style>
    </div>
  );
};

export default BreakingNews;