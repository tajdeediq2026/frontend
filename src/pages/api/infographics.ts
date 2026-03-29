import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

export type Infographic = {
  infographicId: number;
  infographicTitle: string;
  infographicSummary: string;
  infographicDescription: string;
  imagePath: string;
  isPublished: boolean | null;
  createdInfographicDate: string;
  modifiedInfographicDate: string;
  categoryId: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7065';
const INFOGRAPHICS_API_URL = `${BASE_URL}/api/Infographics`;

const axiosInstance = axios.create({
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawCategoryId = Array.isArray(req.query.categoryId) ? req.query.categoryId[0] : req.query.categoryId;
  const rawInfographicId = Array.isArray(req.query.infographicId) ? req.query.infographicId[0] : req.query.infographicId;
  const categoryId = typeof rawCategoryId === 'string' ? rawCategoryId.trim() : '';
  const infographicId = typeof rawInfographicId === 'string' ? rawInfographicId.trim() : '';

  try {
    if (infographicId) {
      const singleUrl = `${INFOGRAPHICS_API_URL}/${infographicId}`;
      const response = await axiosInstance.get<Infographic>(singleUrl);
      const item = response.data;

      if (!item || item.isPublished !== true) {
        res.status(404).json({ error: 'Infographic not found' });
        return;
      }

      res.status(200).json(item);
      return;
    }

    let apiUrl = INFOGRAPHICS_API_URL;

    if (categoryId) {
      apiUrl = `${INFOGRAPHICS_API_URL}/category/${categoryId}`;
    }

    const response = await axiosInstance.get<Infographic[]>(apiUrl);
    const infographics = response.data ?? [];

    const publishedInfographics = infographics
      .filter(item => item.isPublished === true)
      .sort(
        (a, b) =>
          new Date(b.createdInfographicDate).getTime() -
          new Date(a.createdInfographicDate).getTime()
      );

    res.status(200).json(publishedInfographics);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Backend may return 404 when a category has no infographics.
      if (infographicId) {
        res.status(404).json({ error: 'Infographic not found' });
        return;
      }

      res.status(200).json([]);
      return;
    }

    console.error('Error fetching infographics:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error URL:', error.config?.url);
    }
    res.status(500).json({ error: 'Failed to fetch infographics' });
  }
}
