'use client';

import { useState } from 'react';

// Comprehensive input sanitization to prevent XSS
function sanitizeInput(input: string): string {
  if (!input) return '';
  let sanitized = input;
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|form|link|meta)[^>]*>[\s\S]*?<\/\1>/gi, '');
  sanitized = sanitized.replace(/(javascript|vbscript|data|blob)\s*:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["']?[^"'>]*/gi, '');
  sanitized = sanitized.replace(/\b(eval|Function|setTimeout|setInterval|execScript|alert|confirm|prompt|document\.|window\.|navigator\.)\s*\(/gi, '');
  sanitized = sanitized.replace(/&(lt|gt|amp|quot|#\d+|#x[0-9a-fA-F]+);/gi, '');
  sanitized = sanitized.replace(/(--|;|'|"\s*(or|and|union|select|insert|update|delete|drop|exec|execute|xp_))/gi, '');
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[<>]/g, '');
  return sanitized.trim();
}

function containsDangerousContent(input: string): boolean {
  if (!input) return false;
  const dangerousPatterns = [
    /<script/i, /javascript\s*:/i, /on\w+\s*=/i, /\beval\s*\(/i,
    /\bFunction\s*\(/i, /<iframe/i, /<object/i, /<embed/i,
    /data\s*:.*base64/i, /\b(union\s+select|drop\s+table|insert\s+into|delete\s+from)\b/i,
  ];
  return dangerousPatterns.some(pattern => pattern.test(input));
}

function isValidPhoneNumber(phone: string): boolean {
  return /^[0-9+\-\s()]{5,20}$/.test(phone);
}

function isValidName(name: string): boolean {
  return /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z\s.\-']{1,200}$/.test(name.trim());
}

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; subject?: string; message?: string }>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string; subject?: string; message?: string } = {};

    if (!name.trim()) {
      errors.name = 'يرجى إدخال الاسم';
    } else if (containsDangerousContent(name)) {
      errors.name = 'الاسم يحتوي على محتوى غير مسموح به';
    } else if (!isValidName(name)) {
      errors.name = 'الاسم يجب أن يحتوي على حروف فقط';
    }

    if (!phone.trim()) {
      errors.phone = 'يرجى إدخال رقم الموبايل';
    } else if (!isValidPhoneNumber(phone.trim())) {
      errors.phone = 'رقم الموبايل غير صالح';
    }

    if (!subject.trim()) {
      errors.subject = 'يرجى إدخال الموضوع';
    } else if (subject.length > 300) {
      errors.subject = 'الموضوع طويل جداً';
    } else if (containsDangerousContent(subject)) {
      errors.subject = 'الموضوع يحتوي على محتوى غير مسموح به';
    }

    if (!message.trim()) {
      errors.message = 'يرجى إدخال الرسالة';
    } else if (message.length > 2000) {
      errors.message = 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)';
    } else if (containsDangerousContent(message)) {
      errors.message = 'الرسالة تحتوي على محتوى غير مسموح به';
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
        contactUsName: sanitizeInput(name),
        contactUsPhoneNumber: phone.trim(),
        contactUsPhoneSubject: sanitizeInput(subject),
        contactUsPhoneMessage: sanitizeInput(message),
      });

      let response;
      try {
        response = await fetch('/api/backend/ContactUs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: submitBody,
        });
      } catch {
        response = await fetch(`${apiUrl}/api/ContactUs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: submitBody,
        });
      }

      if (response.ok) {
        setSuccess(true);
        setName('');
        setPhone('');
        setSubject('');
        setMessage('');
        setFieldErrors({});
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message || 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
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
      <h1 className="text-3xl font-bold text-primaryOther text-right mb-2">تواصل معنا</h1>
      <div className="w-full h-1 bg-primaryOther mb-6"></div>

      {/* Subtitle */}
      <p className="text-center text-gray-600 text-lg mb-8">
        مرحباً بك .. يمكنك ترك رسالتك و سيقوم أحد موظفينا بالرد عليك في أقرب فرصة ممكنة
      </p>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Illustration - Left side (appears on right in RTL) */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <svg viewBox="0 0 500 400" className="w-full max-w-lg" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="250" cy="200" r="160" fill="#e8f5e9" opacity="0.5" />
            {/* Envelope body */}
            <rect x="100" y="130" width="300" height="180" rx="16" fill="#fff" stroke="#2e7d32" strokeWidth="3" />
            {/* Envelope flap */}
            <path d="M100 130 L250 240 L400 130" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" />
            {/* Inner lines (letter content) */}
            <line x1="160" y1="210" x2="340" y2="210" stroke="#c8e6c9" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1="235" x2="300" y2="235" stroke="#c8e6c9" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1="260" x2="260" y2="260" stroke="#c8e6c9" strokeWidth="6" strokeLinecap="round" />
            {/* Paper airplane */}
            <g transform="translate(360, 90) rotate(-15)">
              <path d="M0 0 L50 15 L15 20 Z" fill="#f57c00" />
              <path d="M15 20 L50 15 L20 35 Z" fill="#ef6c00" />
            </g>
            {/* Decorative dots */}
            <circle cx="120" cy="100" r="5" fill="#2e7d32" opacity="0.3" />
            <circle cx="380" cy="340" r="7" fill="#f57c00" opacity="0.3" />
            <circle cx="400" cy="100" r="4" fill="#2e7d32" opacity="0.2" />
            <circle cx="90" cy="300" r="6" fill="#f57c00" opacity="0.2" />
          </svg>
        </div>

        {/* Form - Right side (appears on left in RTL) */}
        <div className="w-full md:w-1/2">
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg p-4 mb-6 text-right">
              <p className="font-semibold">✅ تم إرسال رسالتك بنجاح!</p>
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
                className={`w-full px-4 py-3 border rounded-lg text-right text-black focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors bg-gray-100 ${
                  fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
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
                  const val = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                  setPhone(val);
                  if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }}
                placeholder="رقم الموبايل"
                maxLength={20}
                className={`w-full px-4 py-3 border rounded-lg text-right text-black focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors bg-gray-100 ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {fieldErrors.phone && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.phone}</p>}
            </div>

            {/* Subject */}
            <div>
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (fieldErrors.subject) setFieldErrors(prev => ({ ...prev, subject: undefined }));
                }}
                placeholder="الموضوع"
                maxLength={300}
                className={`w-full px-4 py-3 border rounded-lg text-right text-black focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors bg-gray-100 ${
                  fieldErrors.subject ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {fieldErrors.subject && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.subject}</p>}
            </div>

            {/* Message */}
            <div>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: undefined }));
                }}
                placeholder="الرسالة"
                maxLength={2000}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg text-right text-black focus:outline-none focus:ring-2 focus:ring-primaryOther transition-colors resize-none bg-gray-100 ${
                  fieldErrors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {fieldErrors.message && <p className="text-red-500 text-sm mt-1 text-right">{fieldErrors.message}</p>}
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
