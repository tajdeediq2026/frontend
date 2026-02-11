"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SearchComponent from "./SearchComponent";

type NavigationLink = {
  id: number;
  name: string;
  categorySlug: string;
  isActivated: boolean;
  href: string;
};

const Navigation = () => {
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/navigation');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Navigation data fetched:', data);
        setLinks(data);
      } catch (error) {
        console.error("Failed to fetch navigation links", error);
        
        // Fallback to static links if API fails
        const fallbackLinks = [
          { id: 0, name: "الرئيسية", categorySlug: "home", isActivated: true, href: "/" },
          { id: 997, name: "أعلن معنا", categorySlug: "partners", isActivated: true, href: "/partners" },
          { id: 998, name: "عنا", categorySlug: "about", isActivated: true, href: "/about" },
          { id: 999, name: "اتصل بنا", categorySlug: "contact", isActivated: true, href: "/contact" }
        ];
        setLinks(fallbackLinks);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  return (
    <nav ref={navRef} className="container mx-auto bg-primaryOther font-bold text-white">
      <ul className="flex flex-wrap gap-2 mt-5 px-4 py-2 items-center">
        {loading ? (
          <li className="px-3 py-2">جاري التحميل...</li>
        ) : (
          links.map((link) => (
            <li key={link.id} className="relative group">
              <Link href={link.href} className="px-3 py-2 hover:bg-opacity-80 rounded transition-colors">
                {link.name}
              </Link>
            </li>
          ))
        )}
        {/* Search Button */}
        <li className="mr-auto">
          <SearchComponent />
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
