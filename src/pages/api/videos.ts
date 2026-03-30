import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

export type Video = {
  videoId: number;
  title: string;
  frameContent: string;
  imagePath: string;
  isPublished: boolean | null;
  createdVideoDate: string;
  modifiedVideoDate: string;
  categoryId: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7065';
const VIDEOS_API_URL = `${BASE_URL}/api/Videos`;

const axiosInstance = axios.create({
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawCategoryId = Array.isArray(req.query.categoryId) ? req.query.categoryId[0] : req.query.categoryId;
  const categoryId = typeof rawCategoryId === 'string' ? rawCategoryId.trim() : '';

  try {
    const apiUrl = categoryId
      ? `${VIDEOS_API_URL}/category/${categoryId}`
      : VIDEOS_API_URL;

    const response = await axiosInstance.get<Video[]>(apiUrl);
    const videos = response.data ?? [];

    const publishedVideos = videos
      .filter((item) => item.isPublished === true)
      .sort(
        (a, b) =>
          new Date(b.createdVideoDate).getTime() -
          new Date(a.createdVideoDate).getTime()
      );

    res.status(200).json(publishedVideos);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(200).json([]);
      return;
    }

    console.error('Error fetching videos:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error URL:', error.config?.url);
    }
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
