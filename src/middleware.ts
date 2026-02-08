import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle old article URLs: /article/[id]
  if (pathname.startsWith('/article/')) {
    const articleId = pathname.split('/')[2];
    
    if (articleId) {
      try {
        // Fetch article data to get the category and title for proper URL generation
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
        
        // Create a simple fetch request to get article data
        const response = await fetch(`${apiUrl}/api/Articles/${articleId}`, {
          // Add headers for development HTTPS
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const article = await response.json();
          
          // Fetch categories to get category slug
          const categoriesResponse = await fetch(`${apiUrl}/api/Categories`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            const category = categories.find((c: { id: number; name: string; categorySlug?: string }) => c.id === article.categoryId);
            
            if (category) {
              // Create slug from article title
              const createSlug = (text: string): string => {
                return text
                  .toLowerCase()
                  .replace(/[^\u0600-\u06FF\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim();
              };

              const categorySlug = category.categorySlug || createSlug(category.name);
              const articleSlug = article.id; // Simplified: just use the ID
              const newUrl = `/${categorySlug}/${articleSlug}`;
              
              // Redirect to new URL format
              return NextResponse.redirect(new URL(newUrl, request.url));
            }
          }
        }
      } catch (error) {
        console.error('Error in middleware redirect:', error);
        // If there's an error, let the request continue to the original route
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match article routes but exclude API routes and static files
    '/article/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
