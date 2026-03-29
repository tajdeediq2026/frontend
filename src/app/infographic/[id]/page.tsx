"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArticleImage from "../../../components/ArticleImage";

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

const InfographicPage = () => {
  const params = useParams();
  const infographicId = params?.id as string;

  const [infographic, setInfographic] = useState<Infographic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfographic = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/infographics?infographicId=${infographicId}`);
        if (!response.ok) {
          throw new Error("فشل في تحميل الإنفوجرافيك");
        }

        const data: Infographic = await response.json();
        setInfographic(data);
      } catch (err) {
        console.error("Error loading infographic:", err);
        setError("تعذر تحميل عنصر الإنفوجرافيك");
      } finally {
        setLoading(false);
      }
    };

    if (infographicId) {
      fetchInfographic();
    }
  }, [infographicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primaryOther"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الإنفوجرافيك...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !infographic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-red-500 text-lg mb-4">❌ خطأ</div>
            <p className="text-gray-600 mb-6">{error || "الإنفوجرافيك غير موجود"}</p>
            <Link
              href="/"
              className="px-4 py-2 bg-primaryOther text-white rounded hover:bg-opacity-90 transition-colors inline-block"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <nav className="text-sm mb-4 text-gray-500">
          <ol className="flex items-center space-x-reverse space-x-2">
            <li>
              <Link href="/" className="hover:text-primaryOther transition-colors">
                الرئيسية
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium">إنفوجرافيك</li>
          </ol>
        </nav>

        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-relaxed text-right">
              {infographic.infographicTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-2 text-right">
              {new Date(infographic.createdInfographicDate).toLocaleDateString("ar-SA")}
            </p>
          </div>

          <div className="px-5 sm:px-6 pt-4">
            <div className="relative overflow-hidden rounded-lg bg-gray-100 h-[360px] sm:h-[500px] lg:h-[620px]">
              <ArticleImage
                src={infographic.imagePath || "/img/1.jpg"}
                alt={infographic.infographicTitle}
                className="w-full h-full object-contain"
                fallbackElement={
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">لا توجد صورة</span>
                  </div>
                }
              />
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <section className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-2 text-right">الملخص</h2>
              <p className="text-gray-700 text-right leading-7">
                {infographic.infographicSummary || "لا يوجد ملخص"}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2 text-right">الوصف</h2>
              <p className="text-gray-700 text-right leading-8 whitespace-pre-line">
                {infographic.infographicDescription || "لا يوجد وصف"}
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
};

export default InfographicPage;
