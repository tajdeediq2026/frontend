import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';
import { getBackendBaseUrl } from '@/lib/backend-url';

type BackendAuthorArticle = {
  authorArticleId: string;
  authorArticleTitle: string | null;
  authorArticleContent: string | null;
  imagePath: string | null;
  createdDate: string;
  updatedDate: string;
  isPublished: boolean;
  authorId: number;
  authorName: string | null;
  tagId: number | null;
  tagName: string | null;
};

type FrontendOpinionArticle = {
  id: string;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  imagePath: string;
  createdDate: string;
  updatedDate: string;
  isPublished: boolean;
  categoryId: number;
  tagId: number;
  tagName: string;
};

const BASE_URL = getBackendBaseUrl();
const AUTHOR_ARTICLES_API_URL = `${BASE_URL}/api/AuthorArticles`;

const axiosInstance = axios.create({
  timeout: 15000,
  httpsAgent: process.env.NODE_ENV === 'development' ? new https.Agent({ rejectUnauthorized: false }) : undefined,
});

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function toOpinionArticle(item: BackendAuthorArticle, opinionsCategoryId: number): FrontendOpinionArticle {
  const content = item.authorArticleContent || '';
  const summary = stripHtml(content).slice(0, 220);

  return {
    id: item.authorArticleId,
    articleTitle: item.authorArticleTitle || 'مقال',
    articleSummary: summary,
    articleContent: content,
    imagePath: item.imagePath || '',
    createdDate: item.createdDate,
    updatedDate: item.updatedDate,
    isPublished: item.isPublished,
    categoryId: opinionsCategoryId,
    tagId: item.tagId ?? 0,
    tagName: item.tagName || '',
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const opinionsCategoryId = Number(req.query.opinionsCategoryId ?? 11);

  try {
    const response = await axiosInstance.get<BackendAuthorArticle[]>(AUTHOR_ARTICLES_API_URL);
    const data = Array.isArray(response.data) ? response.data : [];

    const mapped = data
      .filter((item) => item.isPublished)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .map((item) => toOpinionArticle(item, opinionsCategoryId));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Error fetching author articles:', error);
    res.status(200).json([]);
  }
}
