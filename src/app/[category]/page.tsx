"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DynamicCategorySection, { CategoryWithArticles } from "../../components/DynamicCategorySection";
import ArticleImage from "../../components/ArticleImage";
import LastNewsForCategory from "../../components/LastNewsForCategory";
import InfographicsNews from "../../components/InfographicsNews";
import VideosNews from "../../components/VideosNews";
import PodcastsNews from "../../components/PodcastsNews";
import Link from "next/link";

const CategoryRootPage = () => {
  const params = useParams();
  const categorySlug = params?.category as string;
  const [category, setCategory] = useState<CategoryWithArticles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const categoriesResponse = await fetch('/api/categories-with-articles');
        if (!categoriesResponse.ok) {
          throw new Error('فشل في تحميل التصنيفات');
        }
        const categories: CategoryWithArticles[] = await categoriesResponse.json();
        const foundCategory = categories.find(cat => cat.categorySlug === categorySlug);
        if (!foundCategory) {
          setError("التصنيف غير موجود");
          return;
        }
        setCategory(foundCategory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };
    if (categorySlug) {
      fetchCategory();
    }
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primaryOther"></div>
            <p className="mt-4 text-gray-600">جاري تحميل التصنيف...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">❌ خطأ</div>
            <p className="text-gray-600">{error || 'التصنيف غير موجود'}</p>
            <div className="mt-4">
              <Link 
                href="/"
                className="px-4 py-2 bg-primaryOther text-white rounded hover:bg-opacity-90 transition-colors inline-block"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-right">
            {category.name}
          </h1>
          <p className="mt-2 text-gray-600 text-right">
            {category.articles.length} مقال متاح في هذا التصنيف
          </p>
        </div> */}
      </div>
      {/* Main Layout with Category Content and Last News Sidebar - Same as Main Page */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Left Content - Category Sections */}
          <div className="col-span-12 lg:col-span-12">
            <DynamicCategorySection
              category={category}
              showHeader={false}
              showViewAll={false}
              isCategoryPage={true}
            />

            {/* Two columns below: Additional Articles (left) and Last News (right) */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Additional Articles Section - Left side */}
              {category.articles.length > 5 && (
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-700 whitespace-nowrap flex-shrink-0">
                      {category.name}
                    </h3>
                    <div className="flex-1 h-1 bg-primaryOther rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {category.articles.slice(5).map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        className="group flex flex-col bg-white rounded-lg sm:rounded-xl category-card overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full"
                      >
                        <div className="aspect-video sm:aspect-[4/3] relative overflow-hidden">
                          <ArticleImage
                            src={
                              article.imagePath ||
                              "/tajdeed-logo.png"
                            }
                            alt={article.articleTitle || "Food Image"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            fallbackElement={
                              <ArticleImage
                                src="/tajdeed-logo.png"
                                alt="Food Image Fallback"
                                className="w-full h-full object-cover"
                                fallbackElement={
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-lg">
                                      صورة المقال
                                    </span>
                                  </div>
                                }
                              />
                            }
                          />
                          {/* Light overlay for text contrast only */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10" />
                          {/* Article title on image */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
                            <h4 className="font-bold text-sm sm:text-base line-clamp-2 text-white article-title-shadow">
                              {article.articleTitle}
                            </h4>
                          </div>
                        </div>
                        {/* Date and Summary below image */}
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>
                              {new Date(article.createdDate).toLocaleDateString("en-US")}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 text-right leading-5 sm:leading-6 min-h-10 sm:min-h-12 overflow-hidden">
                            {article.articleSummary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Last News Section - Right side */}
              <div className={category.articles.length > 5 ? "lg:col-span-4" : "lg:col-span-12"}>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
                  <div className="text-primaryOther mx-2">
                    <p className="text-xs sm:text-sm font-semibold">
                      آخر الأخبار
                    </p>
                  </div>
                  <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
                </div>
                <LastNewsForCategory categoryId={category.id} />
                <InfographicsNews categoryId={category.id} className="mt-6" />
                <VideosNews categoryId={category.id} className="mt-6" />
                <PodcastsNews categoryId={category.id} className="mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRootPage;
