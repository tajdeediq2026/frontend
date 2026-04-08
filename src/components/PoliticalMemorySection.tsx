"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleImage from "./ArticleImage";
import { getBackendBaseUrl } from "../lib/backend-url";

type PoliticalMemoryItem = {
  politicalMemoryId: number;
  politicalMemoryTitle: string | null;
  politicalMemoryFrameContent: string | null;
  politicalMemoryImagePath: string | null;
  politicalMemoryIsPublished: boolean | null;
  politicalMemoryCreatedDate: string;
  politicalMemoryModifiedDate: string;
};

interface PoliticalMemorySectionProps {
  className?: string;
}

function normalizeVideoUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("/")[0];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }

      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/watch?v=${id}` : parsed.toString();
    }

    if (host.includes("vimeo.com")) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function extractVideoUrl(content?: string | null): string | null {
  if (!content) return null;

  const srcMatch = content.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch?.[1]) {
    const normalized = normalizeVideoUrl(srcMatch[1]);
    if (normalized) return normalized;
  }

  const urlMatch = content.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch?.[0]) {
    const normalized = normalizeVideoUrl(urlMatch[0]);
    if (normalized) return normalized;
  }

  return null;
}

function getYouTubeThumbnail(videoUrl?: string | null): string | null {
  if (!videoUrl) return null;

  try {
    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();
    let id: string | null = null;

    if (host === "youtu.be") {
      id = parsed.pathname.replace(/^\//, "").split("/")[0] || null;
    } else if (host.includes("youtube.com")) {
      id = parsed.searchParams.get("v");
      if (!id && parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
      }
    }

    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

const PoliticalMemorySection = ({ className = "" }: PoliticalMemorySectionProps) => {
  const [items, setItems] = useState<PoliticalMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticalMemory = async () => {
      try {
        setLoading(true);
        const backendBase = getBackendBaseUrl();
        const response = await fetch(`${backendBase}/api/PoliticalMemory`, { cache: "no-store" });

        if (!response.ok) {
          setItems([]);
          return;
        }

        const data: PoliticalMemoryItem[] = await response.json();
        const published = (Array.isArray(data) ? data : [])
          .filter((item) => item.politicalMemoryIsPublished !== false)
          .sort(
            (a, b) =>
              new Date(b.politicalMemoryModifiedDate || b.politicalMemoryCreatedDate).getTime() -
              new Date(a.politicalMemoryModifiedDate || a.politicalMemoryCreatedDate).getTime()
          )
          .slice(0, 3);

        setItems(published);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalMemory();
  }, []);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
        <div className="text-primaryOther mx-2">
          <p className="text-xs sm:text-sm font-semibold">الذاكرة السياسية</p>
        </div>
        <div className="w-12 sm:w-16 h-1 bg-primaryOther border-0 rounded-sm"></div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 space-y-4">
          {loading && (
            <div className="text-center py-8 text-sm text-gray-500">جاري التحميل...</div>
          )}

          {!loading &&
            items.map((item, index) => {
              const videoUrl = extractVideoUrl(item.politicalMemoryFrameContent);
              const thumbnailSrc = item.politicalMemoryImagePath || getYouTubeThumbnail(videoUrl);

              const cardContent = (
                <div className="flex flex-row-reverse items-start gap-3">
                  <div className="flex-1 min-w-0 text-right">
                    <h3 className="text-lg leading-9 text-[#0f1a3a] line-clamp-3 hover:text-primaryOther transition-colors">
                      {item.politicalMemoryTitle || "الذاكرة السياسية"}
                    </h3>
                  </div>

                  <div className="relative w-40 h-28 flex-shrink-0 overflow-hidden rounded-sm bg-gray-100">
                    <ArticleImage
                      src={thumbnailSrc || undefined}
                      alt={item.politicalMemoryTitle || "الذاكرة السياسية"}
                      className="object-cover"
                      fallbackElement={
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <span className="text-sm text-slate-600">معاينة الفيديو</span>
                        </div>
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="w-11 h-11 rounded-full bg-white/90 text-primaryOther shadow-md flex items-center justify-center text-lg">
                        ▶
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={item.politicalMemoryId}>
                  {videoUrl ? (
                    <Link href={videoUrl} target="_blank" rel="noopener noreferrer" className="block">
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )}

                  {index < items.length - 1 && <div className="border-b border-gray-200 mt-4"></div>}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PoliticalMemorySection;