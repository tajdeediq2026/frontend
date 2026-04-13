import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';
import { getBackendBaseUrl } from '@/lib/backend-url';
import { setNoStoreHeaders } from '../../lib/apiCache';

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
const BASE_URL = getBackendBaseUrl();
const CATEGORIES_API_URL = `${BASE_URL}/api/Categories`;

// Configure axios to handle HTTPS development certificates
const axiosInstance = axios.create({
    timeout: 30000, // Increased timeout to 30 seconds
    httpsAgent: process.env.NODE_ENV === 'development' ? 
        new https.Agent({ rejectUnauthorized: false }) : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    setNoStoreHeaders(res);
    try {
        console.log('Fetching categories from:', CATEGORIES_API_URL);
        
        // Fetch categories from backend
        const response = await axiosInstance.get<CategoryResponse[]>(CATEGORIES_API_URL);
        const categories = response.data;
        
        console.log('Categories fetched:', categories);

        // Transform backend data to NavigationLink format
        const dynamicLinks: NavigationLink[] = categories
            .filter((category: CategoryResponse) => category.isActivated) // Only include activated categories
            .map((category: CategoryResponse) => {
                const normalizedName = (category.name || '').trim();
                const normalizedSlug = (category.categorySlug || '').trim().toLowerCase();
                const isCaricatureCategory =
                    normalizedName === 'كاريكاتير' ||
                    normalizedSlug === 'caricature' ||
                    normalizedSlug === 'caricatures';

                return {
                    id: category.id,
                    name: category.name,
                    categorySlug: category.categorySlug,
                    isActivated: category.isActivated,
                    href: isCaricatureCategory ? '/caricatures' : `/${category.categorySlug}`,
                };
            });

        // Combine: Home first, then dynamic categories
        const allLinks = [
            { id: 0, name: 'الرئيسية', categorySlug: 'home', isActivated: true, href: '/' },
            ...dynamicLinks,
        ];

        console.log('Final navigation links:', allLinks);
        res.status(200).json(allLinks);
    } catch (error) {
        console.error('Error fetching categories for navigation:', error);
        
        // Fallback to static navigation if backend is unavailable
        const fallbackLinks: NavigationLink[] = [
            { id: 0, name: 'الرئيسية', categorySlug: 'home', isActivated: true, href: '/' },
        ];
        
        console.log('Using fallback navigation links:', fallbackLinks);
        res.status(200).json(fallbackLinks);
    }
}
