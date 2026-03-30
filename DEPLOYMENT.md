# Frontend Deployment (GitHub -> Vercel)

This repository uses GitHub Actions workflow:

- .github/workflows/deploy-vercel.yml

## Required GitHub repository secrets

Add these in: Settings -> Secrets and variables -> Actions

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

## Vercel environment variables

In Vercel project settings, add:

- NEXT_PUBLIC_API_URL=https://tajdeediq-001-site1.stempurl.com

Notes:
- Use the backend base URL only (do not add /api).
- If this variable is missing or set to placeholder values, the app now falls back to https://tajdeediq-001-site1.stempurl.com.

## Deploy

- Push to main branch, or
- Run workflow manually from Actions tab: Deploy Frontend To Vercel
