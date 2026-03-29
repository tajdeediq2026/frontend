"use client";

import Link from 'next/link';
import TestImageDisplay from '../../components/TestImageDisplay';

export default function ImageTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Image Display Test
        </h1>
        
        <TestImageDisplay
          imageUrl="/tajdeed-logo.png"
          title="Food Image Test"
          description="Testing image loading using local static asset fallback"
        />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}