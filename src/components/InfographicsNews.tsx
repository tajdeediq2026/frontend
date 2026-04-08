"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import { TimeIcon } from "./UiIcons";

type Infographic = {
  infographicId: number;
  infographicTitle: string;
  infographicSummary: string;
  infographicDescription: string;
  imagePath: string;
  isPublished: boolean | null;
  createdInfographicDate: string;
  modifiedInfographicDate: string;
  categoryId: number;
};

interface InfographicsNewsProps {
  className?: string;
  categoryId?: number;
}

const InfographicsNews = ({ className = "", categoryId }: InfographicsNewsProps) => {
  const [items, setItems] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = categoryId ? `?categoryId=${categoryId}` : "";
        const response = await fetch(`/api/infographics${query}`);

        if (!response.ok) {
          setItems([]);
          setError(null);
          return;
        }

        const data: Infographic[] = await response.json();
        setItems(data.slice(0, 5));
      } catch {
        setError("فشل في تحميل الإنفوجرافيك");
      } finally {
        setLoading(false);
      }
    };

    fetchInfographics();
  }, [categoryId]);

  if (!loading && (error || items.length === 0)) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <div className="text-primaryOther mx-2">
          <p className="text-xs sm:text-sm font-semibold">الإنفوجرافيك</p>
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
                  <div key={item.infographicId} className="relative">
                    <Link href={`/infographic/${item.infographicId}`} className="block">
                      <div className="bg-gray-50 hover:bg-blue-50 rounded-lg p-2 transition-colors duration-200">
                        <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          {item.imagePath && item.imagePath.trim() !== "" && (
                            <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded">
                              <ArticleImage
                                src={item.imagePath}
                                alt={item.infographicTitle}
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
                              {item.infographicTitle}
                            </h3>
                            <p className="text-xs text-gray-600 text-right line-clamp-1 mb-1">
                              {item.infographicSummary}
                            </p>
                            <p className="text-xs text-gray-500 text-right line-clamp-1 mb-1">
                              {item.infographicDescription}
                            </p>
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-xs text-gray-500">
                                {new Date(item.createdInfographicDate).toLocaleDateString("en-US")}
                              </span>
                              <TimeIcon className="text-gray-500 text-xs w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
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

export default InfographicsNews;
