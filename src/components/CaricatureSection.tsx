"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import { getBackendBaseUrl } from "../lib/backend-url";

type CaricatureItem = {
  caricatureId: string;
  caricatureTitle: string | null;
  caricatureContent: string | null;
  imagePath: string | null;
  isPublished: boolean;
  createdDate: string;
  updatedDate: string;
};

interface CaricatureSectionProps {
  className?: string;
}

const CaricatureSection = ({ className = "" }: CaricatureSectionProps) => {
  const [items, setItems] = useState<CaricatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaricatures = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendBase = getBackendBaseUrl();
        let response = await fetch(`${backendBase}/api/Caricatures`, { cache: "no-store" });

        // Fallback path in case a deployment/network policy blocks direct calls.
        if (!response.ok) {
          response = await fetch(`/api/backend/Caricatures`, { cache: "no-store" });
        }

        if (!response.ok) {
          setError("تعذر تحميل الكاريكاتير حالياً");
          setItems([]);
          return;
        }

        const data: CaricatureItem[] = await response.json();
        const published = (Array.isArray(data) ? data : [])
          .filter((item) => item.isPublished === true)
          .sort(
            (a, b) =>
              new Date(b.updatedDate).getTime() -
              new Date(a.updatedDate).getTime()
          )
          .slice(0, 3);

        setItems(published);
      } catch {
        setError("تعذر تحميل الكاريكاتير حالياً");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaricatures();
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <div className="text-primaryOther mx-2">
          <Link href="/caricatures" className="text-xs sm:text-sm font-semibold hover:underline">
            كاريكاتير
          </Link>
        </div>
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 space-y-4">
          {loading && (
            <div className="text-center py-8 text-sm text-gray-500">جاري التحميل...</div>
          )}

          {!loading && error && (
            <div className="text-center py-8 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">لا توجد عناصر منشورة حالياً</div>
          )}

          {!loading && !error &&
            items.map((item, index) => (
              <div key={item.caricatureId}>
                <Link href={`/caricatures/${item.caricatureId}`} className="block">
                  <div className="flex flex-row-reverse items-start gap-3">
                    <div className="flex-1 min-w-0 text-right">
                      <h3 className="text-lg leading-9 text-[#0f1a3a] line-clamp-3 hover:text-primaryOther transition-colors">
                        {item.caricatureTitle || "كاريكاتير"}
                      </h3>
                      {item.caricatureContent && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.caricatureContent}
                        </p>
                      )}
                    </div>

                    <div className="relative w-40 h-28 flex-shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      <ArticleImage
                        src={item.imagePath || undefined}
                        alt={item.caricatureTitle || "كاريكاتير"}
                        className="object-cover"
                        fallbackElement={
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <span className="text-sm text-slate-600">صورة</span>
                          </div>
                        }
                      />
                    </div>
                  </div>
                </Link>

                {index < items.length - 1 && <div className="border-b border-gray-200 mt-4"></div>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CaricatureSection;
