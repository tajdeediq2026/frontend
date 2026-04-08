"use client";

import { useEffect, useState } from "react";
import ArticleImage from "./ArticleImage";
import { TimeIcon } from "./UiIcons";

type Podcast = {
  podcastId: number;
  podcastTitle: string;
  podcastSummary: string;
  podcastLink: string;
  imagePath: string;
  isPublished: boolean | null;
  createdDate: string;
  updatedDate: string;
  categoryId: number;
};

interface PodcastsNewsProps {
  className?: string;
  categoryId?: number;
}

const PodcastsNews = ({ className = "", categoryId }: PodcastsNewsProps) => {
  const [items, setItems] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = categoryId ? `?categoryId=${categoryId}` : "";
        const response = await fetch(`/api/podcasts${query}`);

        if (!response.ok) {
          setItems([]);
          setError(null);
          return;
        }

        const data: Podcast[] = await response.json();
        setItems(data.slice(0, 5));
      } catch {
        setError("فشل في تحميل البودكاست");
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [categoryId]);

  if (!loading && (error || items.length === 0)) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <div className="text-primaryOther mx-2">
          <p className="text-xs sm:text-sm font-semibold">البودكاست</p>
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
                  <div key={item.podcastId} className="relative">
                    <div className="bg-gray-50 hover:bg-blue-50 rounded-lg p-2 transition-colors duration-200">
                      <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {item.imagePath && item.imagePath.trim() !== "" && (
                          <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded">
                            <ArticleImage
                              src={item.imagePath}
                              alt={item.podcastTitle}
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
                            {item.podcastTitle}
                          </h3>
                          <p className="text-xs text-gray-600 text-right line-clamp-2 mb-1">
                            {item.podcastSummary || "بودكاست جديد"}
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdDate).toLocaleDateString("en-US")}
                            </span>
                            <TimeIcon className="text-gray-500 text-xs w-3.5 h-3.5" />
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

export default PodcastsNews;
