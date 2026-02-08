'use client'
import Image from "next/image";
import React from "react";
import { IoMdTime } from "react-icons/io";
import { useCurrentDate } from "../hooks/useDateFormatting";
import SocialMediaIcons from "./SocialMediaIcons";

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
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Left Section - Arabic Text (was on right) */}
        <div className="flex flex-col items-start text-left">
          <p className="font-extrabold text-4xl text-primaryOther mb-1">
            عدالة وتقدم
          </p>
          <p className="text-3xl font-extrabold text-primaryOther">
            Tajdeed Movement
          </p>
        </div>

        {/* Center Section - Logo */}
        <div className="flex justify-center items-center">
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
              className="max-w-full h-auto"
            />
          </a>
        </div>

        {/* Right Section - Date and Social Media (was on left) */}
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-lg font-medium">{currentDate}</span>
            <IoMdTime className="text-lg" />
          </div>
          <div>
            <SocialMediaIcons className="flex items-center gap-2 mt-3" iconSize={40} variant="header" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Up;
