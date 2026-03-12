'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// For blob image support
import { useRef } from 'react';
import { articlesApi, getCategories } from '../app/lib/api';
import { AllArticles } from '../app/types/Articles';
import { encodeImageUrl } from '../app/lib/imageUtils';
import { formatDateArabic } from '../app/lib/hijriUtils';

interface OtherCategoriesProps {
  categoryFilter?: number;
  limit?: number;
}

const OtherCategories: React.FC<OtherCategoriesProps> = ({ categoryFilter, limit = 6 }) => {
  const [articles, setArticles] = useState<AllArticles[]>([]);
  // Removed unused categories state
  const [loading, setLoading] = useState(true);
  const [imageBlobs, setImageBlobs] = useState<{ [key: string]: string }>({});
  const fetchedImages = useRef<{ [key: string]: boolean }>({});
  // Fetch images as blobs for localhost
  useEffect(() => {
    const fetchImages = async () => {
      const newBlobs: { [key: string]: string } = {};
      await Promise.all(
        articles.map(async (article) => {
          const url = article.imagePath;
          if (
            url &&
            url.startsWith('https://localhost') &&
            !fetchedImages.current[url]
          ) {
            try {
              // Encode the URL properly to handle spaces and special characters
              const encodedUrl = encodeImageUrl(url);
              const res = await fetch(encodedUrl);
              if (res.ok) {
                const blob = await res.blob();
                newBlobs[url] = URL.createObjectURL(blob);
                fetchedImages.current[url] = true;
              }
            } catch {
              // ignore fetch error, fallback to url
            }
          }
        })
      );
      if (Object.keys(newBlobs).length > 0) {
        setImageBlobs((prev) => ({ ...prev, ...newBlobs }));
      }
    };
    if (articles.length > 0) fetchImages();
  }, [articles]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first (removed unused categories state)
        await getCategories();
        
        // Then fetch articles
        let articlesData: AllArticles[];
        if (categoryFilter) {
          articlesData = await articlesApi.getByCategory(categoryFilter);
        } else {
          articlesData = await articlesApi.getAll();
        }
        
        // Filter published articles and sort by createdDate (newest first)
        const sortedArticles = articlesData
          .filter(article => article.isPublished)
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        
        setArticles(sortedArticles);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryFilter]);


  if (loading) {
    return (
      <div className="container mx-auto py-4">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
              <div className="w-full aspect-[16/10] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {articles.slice(0, limit).map((article) => (
          <Link
            key={article.id}
            href={`/${article.categoryId}/${article.id}`}
            className="block"
          >
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer">
              {article.imagePath && article.imagePath.trim() !== '' ? (
                <>
                  <div className="w-full aspect-[16/10] relative group">
                    {/* Use <Image> for normal URLs, <img> for blob URLs */}
                    {/*
                      Use <Image> for normal URLs to get Next.js optimization and avoid warnings.
                      Use <img> for blob URLs (from localhost fetch) because <Image> does not support blob URLs.
                      The warning for <img> can be safely ignored for blobs.
                    */}
                    <Image
                      src={imageBlobs[article.imagePath] ? imageBlobs[article.imagePath] : article.imagePath}
                      alt={article.articleTitle}
                      fill
                      className="object-cover rounded-t-xl"
                      style={{ objectPosition: 'center' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                      loader={({ src }) => src}
                      unoptimized={!!imageBlobs[article.imagePath]}
                    />
                    {/* Light gradient overlay for subtle effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    
                    {/* Article title overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <h3 className="text-white font-bold text-base sm:text-lg md:text-xl leading-[1.35] sm:leading-[1.4] text-right line-clamp-2 article-title-shadow-soft">
                        {article.articleTitle}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Content below image */}
                  <div className="p-4">
                    {/* Date with icon */}
                    <div className="flex items-center justify-end gap-2 mb-3 text-gray-600">
                      <span className="text-sm">
                        {formatDateArabic(new Date(article.createdDate), { showHijri: false, showGregorian: true })}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    
                    {/* Article summary */}
                    <p className="text-gray-700 text-sm text-right line-clamp-2 leading-5 sm:leading-6 min-h-10 sm:min-h-12 overflow-hidden">
                      {article.articleSummary}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full aspect-[16/10] bg-gray-100 flex items-center justify-center rounded-t-xl relative">
                    <span className="text-gray-400">لا توجد صورة</span>
                    {/* Title overlay even for placeholder */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <h3 className="text-white font-bold text-base sm:text-lg md:text-xl leading-[1.35] sm:leading-[1.4] text-right line-clamp-2 article-title-shadow-soft">
                        {article.articleTitle}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Content below image */}
                  <div className="p-4">
                    {/* Date with icon */}
                    <div className="flex items-center justify-end gap-2 mb-3 text-gray-600">
                      <span className="text-sm">
                        {formatDateArabic(new Date(article.createdDate), { showHijri: false, showGregorian: true })}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    
                    {/* Article summary */}
                    <p className="text-gray-700 text-sm text-right line-clamp-2 leading-5 sm:leading-6 min-h-10 sm:min-h-12 overflow-hidden">
                      {article.articleSummary}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد مقالات متاحة</p>
        </div>
      )}
    </div>
  );
};

export default OtherCategories;
