"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/navigation');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setLinks(data);
      } catch (error) {
        console.error("Failed to fetch navigation links", error);
        
        // Fallback to static links if API fails
        const fallbackLinks = [
          { id: 0, name: "الرئيسية", categorySlug: "home", isActivated: true, href: "/" },
          { id: 997, name: "أعلن معنا", categorySlug: "partners", isActivated: true, href: "/partners" },
          { id: 998, name: "عنا", categorySlug: "about", isActivated: true, href: "/about" },
          { id: 999, name: "تواصل معنا", categorySlug: "contact", isActivated: true, href: "/contact" }
        ];
        setLinks(fallbackLinks);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="container mx-auto bg-primaryOther font-bold text-white">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <ul className="flex flex-wrap gap-2 px-4 py-2 items-center">
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
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <SearchComponent />
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-white/20 px-4 py-2">
            <ul className="flex flex-col gap-1">
              {loading ? (
                <li className="px-3 py-2">جاري التحميل...</li>
              ) : (
                links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 hover:bg-white/20 rounded transition-colors text-right"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
