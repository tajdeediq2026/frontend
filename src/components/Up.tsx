'use client'
import Image from "next/image";
import React from "react";
import { useCurrentDate } from "../hooks/useDateFormatting";
import SocialMediaIcons from "./SocialMediaIcons";
import { TimeIcon } from "./UiIcons";

function Up() {
  const currentDate = useCurrentDate({
    format: 'arabic',
    showHijri: false,      // Only show Gregorian
    showGregorian: true,
    hijriFirst: false,
    separator: ''
  });
  
  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 items-center">
        {/* Left Section - Arabic Text (was on right) */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
          <p className="font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primaryOther mb-1">
            عدالة وتقدم
          </p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-primaryOther">
            Tajdeed Movement
          </p>
        </div>

        {/* Center Section - Logo */}
        <div className="flex justify-center items-center order-1 md:order-2">
          <a
            href="#"
            title="الصفحة الرئيسية - تجديد"
            className="hover:opacity-90 transition-opacity"
          >
            <Image
              src={"/tajdeed-logo.png"}
              alt="شعار جريدة تجديد"
              width={140}
              height={140}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-[140px] lg:h-[140px] max-w-full"
            />
          </a>
        </div>

        {/* Right Section - Date and Social Media (was on left) */}
        <div className="flex flex-col items-center md:items-end space-y-1 md:space-y-2 order-3">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm md:text-lg font-medium">{currentDate}</span>
            <TimeIcon className="text-sm md:text-lg w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <SocialMediaIcons className="flex items-center gap-1 sm:gap-2 mt-1 md:mt-3" iconSize={28} variant="header" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Up;
