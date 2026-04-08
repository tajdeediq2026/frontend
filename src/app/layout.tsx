import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Footer from "@/components/Footer";

import Navigation from "@/components/Navigation";
import Up from "@/components/Up";
import BreakingNews from "@/components/BreakingNews";
import { ThemeProvider } from "@/lib/theme";

const inter = localFont({
  src: [
    {
      path: "../app/fonts/ArbFONTS-Al-Jazeera-Arabic-Bold.ttf",
      weight: "400",
      style: "normal",
    },
    // {
    //   path: "../public/fonts/Inter-Bold.woff2",
    //   weight: "700",
    //   style: "normal",
    // },
  ],
  variable: "--font-inter", // Optional: Use in Tailwind
  display: "swap",
  preload: false,
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
      <head>
        {/* Prevent flash of unstyled content on theme change */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const initialTheme = theme || (prefersDark ? 'dark' : 'light');
                if (initialTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}
      <body className={inter.className}>
        <ThemeProvider>
          <Up />
          <Navigation />
          <BreakingNews />

          {/* <OtherCategories /> */}
          {/* <MainPictures /> */}
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
