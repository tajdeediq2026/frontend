"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SocialMediaIcons from "./SocialMediaIcons";

type CategoryLink = {
  id: number;
  name: string;
  categorySlug: string;
  isActivated: boolean;
  href: string;
};

function Footer() {
  const [categories, setCategories] = useState<CategoryLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/navigation');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Footer categories data fetched:', data);
        
        // Filter out non-category links (home, about, contact)
        const categoryLinks = data.filter((link: CategoryLink) => 
          link.id !== 0 && link.id !== 998 && link.id !== 999
        );
        
        setCategories(categoryLinks);
      } catch (error) {
        console.error("Failed to fetch footer categories", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Split categories into two columns for better layout

  return (
    <footer className="text-white">
      {/* Green Background Section with Container */}
      <div className="bg-primaryOther container mx-auto px-4">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 md:py-12"
            dir="rtl"
          >
            {/* Logo and Description Section - 3 columns on desktop */}
            <div className="md:col-span-3 text-center md:text-center">
              <Link
                href="/"
                title="الصفحة الرئيسية - تجديد"
                className="inline-block mb-4"
              >
                <Image
                  src={"/tajdeed-logo.png"}
                  alt="شعار جريدة تجديد"
                  width={120}
                  height={120}
                  className="hover:opacity-90 transition-opacity mt-10"
                />
              </Link>
              {/* <p className="text-sm text-gray-200 leading-relaxed mt-4">
              جريدة تجديد - منصة إخبارية شاملة تقدم أحدث الأخبار والتحليلات من
              العراق والعالم
            </p> */}
            </div>

            {/* Categories Section - 3 columns on desktop */}
            <div className="md:col-span-3 text-center md:text-right">
              <h3 className="font-bold text-xl mb-4 border-b-2 border-white/20 pb-2 inline-block">
                الأقسام
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/articles"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>كل الأخبار</span>
                  </Link>
                </li>
                {loading ? (
                  <li className="text-gray-300 text-sm">جاري التحميل...</li>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={category.href}
                        className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                      >
                        <span>{category.name}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-300 text-sm">لا توجد أقسام متاحة</li>
                )}
              </ul>
            </div>

            {/* Important Links Section - 3 columns on desktop */}
            <div className="md:col-span-3 text-center md:text-right">
              <h3 className="font-bold text-xl mb-4 border-b-2 border-white/20 pb-2 inline-block">
                روابط مهمة
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>عن جريدة تجديد</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>شروط الخدمة</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>سياسة الخصوصية</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subscribe"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>اشترك معنا</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/advertise"
                    className="hover:text-gray-200 transition-colors text-sm md:text-base flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>اعلن معنا</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media Section - 3 columns on desktop */}
            <div className="md:col-span-2 text-center md:text-right">
              <h3 className="font-bold text-xl mb-4 border-b-2 border-white/20 pb-2 inline-block">
                تابعنا
              </h3>
              <SocialMediaIcons className="mt-6" iconSize={32} variant="footer" />
              <p className="text-sm text-gray-200 mt-6 leading-relaxed">
                تابع آخر الأخبار والتحديثات على منصات التواصل الاجتماعي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section - Full Width Orange Background */}
      <div className="border-t border-white/20 py-4 bg-orange-500 container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm md:text-base text-white">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} جريدة تجديد
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
