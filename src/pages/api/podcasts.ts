import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';
import { getBackendBaseUrl } from '@/lib/backend-url';
import { setNoStoreHeaders } from './_utils/cache';

export type Podcast = {
  podcastId: number;
  podcastTitle: string;
  podcastSummary: string;
  podcastLink: string;
  imagePath: string;
  isPublished: boolean | null;
  createdDate: string;
  updatedDate: string;
  categoryId: number;
};

const BASE_URL = getBackendBaseUrl();
const PODCASTS_API_URL = `${BASE_URL}/api/Podcasts`;

const axiosInstance = axios.create({
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setNoStoreHeaders(res);
  const rawCategoryId = Array.isArray(req.query.categoryId) ? req.query.categoryId[0] : req.query.categoryId;
  const categoryId = typeof rawCategoryId === 'string' ? rawCategoryId.trim() : '';

  try {
    const apiUrl = categoryId
      ? `${PODCASTS_API_URL}/category/${categoryId}`
      : PODCASTS_API_URL;

    const response = await axiosInstance.get<Podcast[]>(apiUrl);
    const podcasts = response.data ?? [];

    const publishedPodcasts = podcasts
      .filter((item) => item.isPublished === true)
      .sort(
        (a, b) =>
          new Date(b.createdDate).getTime() -
          new Date(a.createdDate).getTime()
      );

    res.status(200).json(publishedPodcasts);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(200).json([]);
      return;
    }

    console.error('Error fetching podcasts:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error URL:', error.config?.url);
    }
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
}
