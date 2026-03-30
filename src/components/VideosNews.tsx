"use client";

import { useEffect, useState } from "react";
import ArticleImage from "./ArticleImage";
import { IoTimeOutline } from "react-icons/io5";

type Video = {
  videoId: number;
  title: string;
  frameContent: string;
  imagePath: string;
  isPublished: boolean | null;
  createdVideoDate: string;
  modifiedVideoDate: string;
  categoryId: number;
};

interface VideosNewsProps {
  className?: string;
  categoryId?: number;
}

const VideosNews = ({ className = "", categoryId }: VideosNewsProps) => {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = categoryId ? `?categoryId=${categoryId}` : "";
        const response = await fetch(`/api/videos${query}`);

        if (!response.ok) {
          setItems([]);
          setError(null);
          return;
        }

        const data: Video[] = await response.json();
        setItems(data.slice(0, 5));
      } catch {
        setError("فشل في تحميل الفيديوهات");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [categoryId]);

  if (!loading && (error || items.length === 0)) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <div className="text-primaryOther mx-2">
          <p className="text-xs sm:text-sm font-semibold">الفيديوهات</p>
        </div>
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col min-h-[280px]">
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {loading && (
              <div className="text-center py-8 text-sm text-gray-500">جاري التحميل...</div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.videoId} className="relative">
                    <div className="bg-gray-50 hover:bg-blue-50 rounded-lg p-2 transition-colors duration-200">
                      <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {item.imagePath && item.imagePath.trim() !== "" && (
                          <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded">
                            <ArticleImage
                              src={item.imagePath}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              fallbackElement={
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">لا توجد صورة</span>
                                </div>
                              }
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-right line-clamp-2 mb-1 hover:text-primaryOther transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 text-right line-clamp-2 mb-1">
                            {item.frameContent?.replace(/<[^>]+>/g, " ").trim() || "فيديو جديد"}
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdVideoDate).toLocaleDateString("en-US")}
                            </span>
                            <IoTimeOutline className="text-gray-500 text-xs" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <div className="border-b border-gray-200 mt-2"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideosNews;
