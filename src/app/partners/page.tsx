'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Duration {
  advertiseWithUsDurationId: number;
  advertiseWithUsDurationName: string;
}

// Comprehensive input sanitization to prevent XSS, script injection, and harmful payloads
function sanitizeInput(input: string): string {
  if (!input) return '';
  let sanitized = input;
  // Remove all HTML tags including self-closing
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');
  // Remove script/style/iframe/object/embed tags and their content
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|form|link|meta)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove dangerous URI schemes
  sanitized = sanitized.replace(/(javascript|vbscript|data|blob)\s*:/gi, '');
  // Remove event handler attributes (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["']?[^"'>]*/gi, '');
  // Remove dangerous JS functions and constructors
  sanitized = sanitized.replace(/\b(eval|Function|setTimeout|setInterval|execScript|alert|confirm|prompt|document\.|window\.|navigator\.)\s*\(/gi, '');
  // Remove encoded HTML entities that could form tags (&lt; &gt; &#60; &#x3C; etc.)
  sanitized = sanitized.replace(/&(lt|gt|amp|quot|#\d+|#x[0-9a-fA-F]+);/gi, '');
  // Remove file extensions that could be harmful
  sanitized = sanitized.replace(/\.(exe|bat|cmd|ps1|sh|vbs|wsf|msi|dll|com|scr|js|jar|py|rb|pl|php|asp|aspx|jsp|cgi)\b/gi, '');
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/(--|;|'|"\s*(or|and|union|select|insert|update|delete|drop|exec|execute|xp_))/gi, '');
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  // Remove backtick expressions (template literals)
  sanitized = sanitized.replace(/`[^`]*`/g, '');
  // Remove any remaining angle brackets
  sanitized = sanitized.replace(/[<>]/g, '');
  return sanitized.trim();
}

// Check if input contains potentially dangerous content
function containsDangerousContent(input: string): boolean {
  if (!input) return false;
  const dangerousPatterns = [
    /<script/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data\s*:.*base64/i,
    /\.(exe|bat|cmd|ps1|sh|vbs|dll|com|scr)\b/i,
    /\b(union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/i,
  ];
  return dangerousPatterns.some(pattern => pattern.test(input));
}

function isValidPhoneNumber(phone: string): boolean {
  return /^[0-9+\-\s()]{5,20}$/.test(phone);
}

// Validate name: only allows letters, spaces, dots, and common name characters
function isValidName(name: string): boolean {
  // Allow Arabic, Latin letters, spaces, dots, hyphens
  return /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z\s.\-']{1,200}$/.test(name.trim());
}

export default function AdvertiseWithUsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [durationId, setDurationId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [durations, setDurations] = useState<Duration[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; notes?: string }>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';

  useEffect(() => {
    const fetchDurations = async () => {
      try {
        // Try proxy route first to avoid CORS issues, fallback to direct API
        let response = await fetch('/api/backend/AdvertiseWithUsDurations');
        if (!response.ok) {
          response = await fetch(`${apiUrl}/api/AdvertiseWithUsDurations`);
        }
        if (response.ok) {
          const data = await response.json();
          setDurations(data);
        }
      } catch (err) {
        console.error('Failed to fetch durations:', err);
        // Fallback to direct API call
        try {
          const response = await fetch(`${apiUrl}/api/AdvertiseWithUsDurations`);
          if (response.ok) {
            const data = await response.json();
            setDurations(data);
          }
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      }
    };
    fetchDurations();
  }, [apiUrl]);

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string; notes?: string } = {};

    if (!name.trim()) {
      errors.name = 'يرجى إدخال الاسم';
    } else if (name.trim().length > 200) {
      errors.name = 'الاسم طويل جداً';
    } else if (containsDangerousContent(name)) {
      errors.name = 'الاسم يحتوي على محتوى غير مسموح به';
    } else if (!isValidName(name)) {
      errors.name = 'الاسم يجب أن يحتوي على حروف فقط';
    }

    if (!phone.trim()) {
      errors.phone = 'يرجى إدخال رقم الموبايل';
    } else if (!isValidPhoneNumber(phone.trim())) {
      errors.phone = 'رقم الموبايل غير صالح. يجب أن يحتوي على أرقام فقط';
    }

    if (notes.length > 1000) {
      errors.notes = 'الملاحظات طويلة جداً (الحد الأقصى 1000 حرف)';
    } else if (containsDangerousContent(notes)) {
      errors.notes = 'الملاحظات تحتوي على محتوى غير مسموح به';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitBody = JSON.stringify({
          advertiseWithUsName: sanitizeInput(name),
          advertiseWithUsPhoneNumber: phone.trim(),
          advertiseWithUsNotes: sanitizeInput(notes),
          advertiseWithUsDurationId: durationId || null,
        });
      // Try proxy route first to avoid CORS issues
      let response;
      try {
        response = await fetch('/api/backend/AdvertiseWithUs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: submitBody,
        });
      } catch {
        response = await fetch(`${apiUrl}/api/AdvertiseWithUs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: submitBody,
        });
      }

      if (response.ok) {
        setSuccess(true);
        setName('');
        setPhone('');
        setDurationId('');
        setNotes('');
        setFieldErrors({});
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-primaryOther text-right mb-2">أعلن معنا</h1>
      <div className="w-full h-1 bg-primaryOther mb-6"></div>

      {/* Subtitle */}
      <p className="text-center text-gray-600 text-lg mb-8">
        مرحباً بك .. للإعلان معنا يمكنك ترك رسالتك و سيقوم أحد موظفينا بالرد عليك في أقرب فرصة ممكنة
      </p>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Illustration - Left side (appears on right in RTL) */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Image
            src="/advertise-illustration.svg"
            alt="أعلن معنا"
            width={800}
            height={600}
            className="w-full max-w-lg object-contain"
            priority
          />
        </div>

        {/* Form - Right side (appears on left in RTL) */}
        <div className="w-full md:w-1/2">
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg p-4 mb-6 text-right">
              <p className="font-semibold">✅ تم إرسال طلبك بنجاح!</p>
              <p className="text-sm mt-1">سيقوم أحد موظفينا بالرد عليك في أقرب فرصة ممكنة.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-4 mb-6 text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="الاسم"
                maxLength={200}
                className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors ${
                  fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.name && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  // Only allow valid phone characters
                  const val = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                  setPhone(val);
                  if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }}
                placeholder="رقم الموبايل"
                maxLength={20}
                className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.phone && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.phone}</p>}
            </div>

            {/* Duration dropdown */}
            <div className="relative">
              <select
                value={durationId}
                onChange={(e) => setDurationId(e.target.value ? Number(e.target.value) : '')}
                title="مدة الإعلان"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primaryOther bg-white transition-colors cursor-pointer"
                dir="rtl"
              >
                <option value="">مدة الإعلان</option>
                {durations.map((d) => (
                  <option key={d.advertiseWithUsDurationId} value={d.advertiseWithUsDurationId}>
                    {d.advertiseWithUsDurationName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Notes */}
            <div>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (fieldErrors.notes) setFieldErrors(prev => ({ ...prev, notes: undefined }));
                }}
                placeholder="ملاحظات"
                maxLength={1000}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors resize-none ${
                  fieldErrors.notes ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.notes && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.notes}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondaryOther text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الإرسال...
                </span>
              ) : (
                'أرسل'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom orange border */}
      <div className="w-full h-1 bg-secondaryOther mt-8"></div>
    </div>
  );
}
