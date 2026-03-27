'use client';

import { useEffect, useMemo, useState } from 'react';

type PrivacyPolicyItem = {
  id: number;
  title?: string | null;
  content?: string | null;
  createdDate?: string;
  modifiedDate?: string;
};

function formatArabicDate(dateValue?: string): string {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

export default function PrivacyPolicySection() {
  const [items, setItems] = useState<PrivacyPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);
        setError('');

        let response = await fetch('/api/backend/PrivacyPolicy', { cache: 'no-store' });

        if (!response.ok) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (apiUrl) {
            response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/PrivacyPolicy`, { cache: 'no-store' });
          }
        }

        if (!response.ok) {
          throw new Error(`PrivacyPolicy request failed with status ${response.status}`);
        }

        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (unknownError) {
        const message = unknownError instanceof Error ? unknownError.message : 'Unknown error';
        console.warn('Failed to load PrivacyPolicy content:', message);
        setError('تعذر تحميل محتوى الصفحة حالياً. يرجى المحاولة لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const latestItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.modifiedDate || b.createdDate || '').getTime() -
          new Date(a.modifiedDate || a.createdDate || '').getTime()
      ),
    [items]
  );

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primaryOther text-right mb-2">سياسة الخصوصية</h1>
      <div className="w-full h-1 bg-primaryOther mb-6"></div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-600">
          جاري تحميل المحتوى...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-right">
          {error}
        </div>
      ) : latestItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-600">
          لا يوجد محتوى متاح حالياً.
        </div>
      ) : (
        <div className="space-y-6">
          {latestItems.map((item) => (
            <article key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
              {item.title && (
                <h2 className="text-2xl font-bold text-primaryOther mb-4 text-right">
                  {item.title}
                </h2>
              )}

              <p className="text-gray-800 leading-8 whitespace-pre-line text-right">
                {item.content || 'لا يوجد وصف متاح لهذا المحتوى.'}
              </p>

              {!!(item.modifiedDate || item.createdDate) && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 text-right">
                  آخر تحديث: {formatArabicDate(item.modifiedDate || item.createdDate)}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
