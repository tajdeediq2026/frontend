"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import { getBackendBaseUrl } from "@/lib/backend-url";

type CaricatureItem = {
  caricatureId: string;
  caricatureTitle: string | null;
  caricatureContent: string | null;
  imagePath: string | null;
  isPublished: boolean;
  createdDate: string;
  updatedDate: string;
};

export default function CaricaturesPage() {
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
              new Date(b.createdDate || b.updatedDate).getTime() -
              new Date(a.createdDate || a.updatedDate).getTime()
          );

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
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center justify-center mb-8">
        <div className="w-24 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <h1 className="text-4xl font-bold text-primaryOther mx-4">كاريكاتير</h1>
        <div className="w-24 h-1 bg-primaryOther border-0 rounded-sm"></div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryOther"></div>
        </div>
      )}

      {!loading && error && (
        <div className="flex justify-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex justify-center py-12">
          <p className="text-gray-500 text-lg">لا توجد كاريكاتيرات منشورة حالياً</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link key={item.caricatureId} href={`/caricatures/${item.caricatureId}`} className="block">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col">
                <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                  <ArticleImage
                    src={item.imagePath || undefined}
                    alt={item.caricatureTitle || "كاريكاتير"}
                    className="object-cover w-full h-full hover:scale-105 transition-transform"
                    fallbackElement={
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-sm text-slate-600">صورة</span>
                      </div>
                    }
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-xl font-semibold text-[#0f1a3a] mb-2 line-clamp-2 hover:text-primaryOther transition-colors">
                    {item.caricatureTitle || "كاريكاتير"}
                  </h2>

                  <div className="text-xs text-gray-500 mt-auto">
                    <span className="font-medium">تاريخ النشر: </span>
                    {new Date(item.createdDate || item.updatedDate).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
