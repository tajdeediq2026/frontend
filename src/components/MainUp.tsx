"use client"

import Image from "next/image";
import { getImageUrl } from "../app/lib/imageUtils";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categoriesApi } from "../app/lib/api";
import { generateArticleUrl } from "../app/lib/urlUtils";
import { getArticles } from "../app/lib/api"; // Fixed import path
import { AllArticles, AllCategories } from "../app/types/Articles";


export default function MainUp() {
  const router = useRouter();
  const [articles, setArticles] = useState<AllArticles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<AllCategories[]>([]);

  // Fetch articles and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting to fetch articles and categories...');
        
        const [articlesData, categoriesData] = await Promise.all([
          getArticles(),
          categoriesApi.getAll()
        ]);
        
        // Filter only published articles and sort by createdDate (newest first)
        const publishedArticles = articlesData
          .filter(article => article.isPublished)
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        
        setArticles(publishedArticles);
        setCategories(categoriesData);
        setRetryCount(0); // Reset retry count on success
        console.log('Successfully loaded articles and categories');
      } catch (error) {
        console.error("Error fetching articles or categories:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        
        // Automatic retry logic for timeout errors
        if (retryCount < 2 && (errorMessage.includes('timeout') || errorMessage.includes('ECONNABORTED'))) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
          // Retry after a short delay
          setTimeout(() => {
            fetchData();
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect
    window.location.reload();
  };

  // Get main (center) article with UpperArticleId = 5
  const mainArticle = articles.find(article => article.upperArticleId === 5);
  
  // Get articles for specific UpperArticle positions
  const rightTopArticle = articles.find(article => article.upperArticleId === 3); // علوي - أيمن 1 -> top-right
  const rightBottomArticle = articles.find(article => article.upperArticleId === 4); // علوي - أيمن 2 -> bottom-right
  const leftTopArticle = articles.find(article => article.upperArticleId === 1); // علوي - أيسر 1 -> top-left  
  const leftBottomArticle = articles.find(article => article.upperArticleId === 2); // علوي - أيسر 2 -> bottom-left
  
  // Collect all positioned articles to exclude from fallback
  const positionedArticleIds = [
    mainArticle?.id,
    rightTopArticle?.id,
    rightBottomArticle?.id,
    leftTopArticle?.id,
    leftBottomArticle?.id
  ].filter(Boolean);
  
  // Fallback articles for any empty positions
  const fallbackArticles = articles.filter(article => 
    !positionedArticleIds.includes(article.id)
  );
  
  // Create final positioned articles with fallbacks
  const leftArticles = [
    leftTopArticle || fallbackArticles[0],
    leftBottomArticle || fallbackArticles[1]
  ].filter(Boolean);
  
  const rightArticles = [
    rightTopArticle || fallbackArticles[2],
    rightBottomArticle || fallbackArticles[3]
  ].filter(Boolean);



  // Helper to get category for an article
  const getCategoryForArticle = (article: AllArticles) => {
    return categories.find((cat) => cat.id === article.categoryId);
  };

  // Handle click to route to article page
  const handleArticleClick = (article: AllArticles) => {
    const category = getCategoryForArticle(article);
    const url = generateArticleUrl(article, category);
    router.push(url);
  };

  // Fetch main image as blob if needed
  useEffect(() => {
    let objectUrl: string | undefined;
    const setUrl = (url: string | undefined) => {
      setMainImageUrl(url);
      objectUrl = url;
    };
    if (!mainArticle || !mainArticle.imagePath) {
      setUrl(undefined);
    } else if (/^https?:\/\//.test(mainArticle.imagePath) || mainArticle.imagePath.startsWith('data:')) {
      setUrl(getImageUrl(mainArticle.imagePath));
    } else {
      // Otherwise, fetch as blob
      const fetchBlob = async () => {
        try {
          const urlStr = getImageUrl(mainArticle.imagePath) || '';
          const res = await fetch(urlStr);
          if (!res.ok) throw new Error('Image fetch failed');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setUrl(url);
        } catch {
          setUrl(undefined);
        }
      };
      fetchBlob();
    }
    // Cleanup object URL
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mainArticle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryOther"></div>
        {retryCount > 0 && (
          <p className="ml-4 text-gray-600">Retrying... ({retryCount}/2)</p>
        )}
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[500px] px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Articles</h3>
          <p className="text-red-700 mb-4 text-sm">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render anything if no articles are available
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Main News Layout */}
      <div className="grid lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Column - Two stacked articles */}
        {leftArticles.length > 0 && (
          <div className="lg:col-span-3 space-y-4 h-full">
            {leftArticles.map((article, index) => (
            <div
              key={`left-${article.id}-${index}`}
              className="relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-[242px]"
              onClick={() => handleArticleClick(article)}
            >
              <div className="relative h-full">
                {getImageUrl(article.imagePath) && (
                  <Image
                    src={getImageUrl(article.imagePath)!}
                    alt={article.articleTitle}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight text-right text-shadow-outline">
                  {article.articleTitle}
                </h3>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Center Column - Main large article */}
        {mainArticle && (
          <div className="lg:col-span-6">
          <div
            className="relative group cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full"
            onClick={() => mainArticle && handleArticleClick(mainArticle)}
          >
            <div className="relative h-full min-h-[500px]">
              {mainImageUrl && (
                <Image
                  src={mainImageUrl}
                  alt={mainArticle?.articleTitle || ""}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Article content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-center mb-4">
                  <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3 text-right text-shadow-outline">
                    {mainArticle?.articleTitle}
                  </h2>
                  <p className="text-gray-200 text-base leading-relaxed text-right text-shadow-outline">
                    {mainArticle?.articleSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Right Column - Two stacked articles */}
        {rightArticles.length > 0 && (
          <div className="lg:col-span-3 space-y-4 h-full">
            {rightArticles.map((article, index) => (
              <div
              key={`right-${article.id}-${index}`}
              className="relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-[242px]"
              onClick={() => handleArticleClick(article)}
            >
              <div className="relative h-full">
                {getImageUrl(article.imagePath) && (
                  <Image
                    src={getImageUrl(article.imagePath)!}
                    alt={article.articleTitle}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight text-right text-shadow-outline">
                  {article.articleTitle}
                </h3>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile responsive layout */}
      {articles.length > 0 && (
        <div className="lg:hidden grid grid-cols-1 gap-4 mt-6">
          {articles.slice(0, 5).map((article, index) => (
          <div
            key={`mobile-${article.id || index}`}
            className="relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden"
            onClick={() => handleArticleClick(article)}
          >
            <div className="relative h-48">
              {getImageUrl(article.imagePath) && (
                <Image
                  src={getImageUrl(article.imagePath)!}
                  alt={article.articleTitle}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg leading-tight text-right text-shadow-outline">
                {article.articleTitle}
              </h3>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
