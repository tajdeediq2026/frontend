import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

type NavigationLink = {
    id: number;
    name: string;
    categorySlug: string;
    isActivated: boolean;
    href: string;
};

type CategoryResponse = {
    id: number;
    name: string;
    categorySlug: string;
    isActivated: boolean;
};

// Backend API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
const CATEGORIES_API_URL = `${BASE_URL}/api/Categories`;

// Configure axios to handle HTTPS development certificates
const axiosInstance = axios.create({
    timeout: 30000, // Increased timeout to 30 seconds
    httpsAgent: process.env.NODE_ENV === 'development' ? 
        new https.Agent({ rejectUnauthorized: false }) : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('Fetching categories from:', CATEGORIES_API_URL);
        
        // Fetch categories from backend
        const response = await axiosInstance.get<CategoryResponse[]>(CATEGORIES_API_URL);
        const categories = response.data;
        
        console.log('Categories fetched:', categories);

        // Transform backend data to NavigationLink format
        const dynamicLinks: NavigationLink[] = categories
            .filter((category: CategoryResponse) => category.isActivated) // Only include activated categories
            .map((category: CategoryResponse) => ({
                id: category.id,
                name: category.name,
                categorySlug: category.categorySlug,
                isActivated: category.isActivated,
                href: `/${category.categorySlug}` // Route to category pages
            }));

        // Static links
        const staticLinks: NavigationLink[] = [
            { id: 0, name: 'الرئيسية', categorySlug: 'home', isActivated: true, href: '/' },
            { id: 997, name: 'أعلن معنا', categorySlug: 'partners', isActivated: true, href: '/partners' },
            { id: 998, name: 'عن جريدة تجديد', categorySlug: 'about', isActivated: true, href: '/about' },
            { id: 999, name: 'تواصل معنا', categorySlug: 'contact', isActivated: true, href: '/contact' }
        ];

        // Combine: Home first, then dynamic categories, then Advertise, About and Contact
        const allLinks = [
            staticLinks[0], // الرئيسية (Home)
            ...dynamicLinks, // All dynamic categories
            staticLinks[1], // أعلن معنا (Advertise)
            staticLinks[2], // عنا (About)
            staticLinks[3]  // اتصل بنا (Contact)
        ];

        console.log('Final navigation links:', allLinks);
        res.status(200).json(allLinks);
    } catch (error) {
        console.error('Error fetching categories for navigation:', error);
        
        // Fallback to static navigation if backend is unavailable
        const fallbackLinks: NavigationLink[] = [
            { id: 0, name: 'الرئيسية', categorySlug: 'home', isActivated: true, href: '/' },
            { id: 997, name: 'أعلن معنا', categorySlug: 'partners', isActivated: true, href: '/partners' },
            { id: 998, name: 'عن جريدة تجديد', categorySlug: 'about', isActivated: true, href: '/about' },
            { id: 999, name: 'تواصل معنا', categorySlug: 'contact', isActivated: true, href: '/contact' }
        ];
        
        console.log('Using fallback navigation links:', fallbackLinks);
        res.status(200).json(fallbackLinks);
    }
}
