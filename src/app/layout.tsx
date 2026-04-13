import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Footer from "@/components/Footer";

import Navigation from "@/components/Navigation";
import Up from "@/components/Up";
import BreakingNews from "@/components/BreakingNews";

const alJazeera = localFont({
  src: [
    {
      path: "./fonts/Al-Jazeera-Arabic-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Al-Jazeera-Arabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Al-Jazeera-Arabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Al-Jazeera-Arabic-Bold-1.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-aljazeera",
  display: "swap",
  preload: true,
});

const alJazeeraBold = localFont({
  src: [
    {
      path: "./fonts/Al-Jazeera-Arabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aljazeera-bold",
  display: "swap",
  preload: true,
});

const alJazeeraRegular = localFont({
  src: [
    {
      path: "./fonts/Al-Jazeera-Arabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-aljazeera-regular",
  display: "swap",
  preload: true,
});

const alJazeeraLight = localFont({
  src: [
    {
      path: "./fonts/Al-Jazeera-Arabic-Light.ttf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-aljazeera-light",
  display: "swap",
  preload: true,
});

// const geistSans = localFont({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "جريدة تجديد",
  description: "جريدة تجديد - آخر الأخبار العراقية والعربية والدولية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}
      <body className={`${alJazeera.variable} ${alJazeeraBold.variable} ${alJazeeraRegular.variable} ${alJazeeraLight.variable}`} suppressHydrationWarning>
        <Up />
        <Navigation />
        <BreakingNews />

        {/* <OtherCategories /> */}
        {/* <MainPictures /> */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
