# YouTube Clone

Full-stack YouTube clone built with React (Vite) + Node.js/Express + MongoDB + AWS S3.

## Project Structure

```
youtube/
├── client/   # React + Vite frontend
└── server/   # Node.js + Express backend
```

## Quick Start

### 1. Backend Setup

```bash
cd server
cp .env.example .env   # Fill in your values
npm install
npm run dev            # Runs on http://localhost:5000
```

**Required `.env` values:**
| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any random secret string |
| `AWS_ACCESS_KEY_ID` | AWS IAM key with S3 access |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_REGION` | e.g. `us-east-1` |
| `AWS_S3_BUCKET` | Your S3 bucket name |
| `AWS_CLOUDFRONT_URL` | Optional CDN URL |
| `CLIENT_URL` | `http://localhost:5173` |

### 2. Frontend Setup

```bash
cd client
# Edit .env — set VITE_API_URL if needed
npm install
npm run dev   # Runs on http://localhost:5173
```

## Features

- **Auth** — Email/password register & login, JWT cookies, Google OAuth ready
- **Videos** — Upload (S3), stream, like/dislike, view count, delete
- **Comments** — Add, edit, delete, replies
- **Channels** — Profile, banner, subscribe/unsubscribe
- **Discovery** — Home feed, trending, category filter, full-text search
- **Playlists** — Create, manage, delete
- **History** — Watch history tracking
- **UI** — Responsive, dark mode ready, infinite scroll, skeleton loaders

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/videos/feed` | Home feed |
| GET | `/api/videos/trending` | Trending |
| GET | `/api/videos/search?q=` | Search |
| POST | `/api/videos` | Upload video |
| GET | `/api/videos/:id` | Get video |
| POST | `/api/videos/:id/like` | Like/unlike |
| POST | `/api/users/:id/subscribe` | Subscribe/unsubscribe |
| GET | `/api/videos/:id/comments` | Get comments |
| POST | `/api/videos/:id/comments` | Add comment |

## AWS S3 Setup

1. Create an S3 bucket with public read or use CloudFront
2. Create an IAM user with `AmazonS3FullAccess`
3. Add credentials to `server/.env`

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6, Zustand, Axios |
| Backend | Node.js, Express 5, Mongoose, JWT, Multer |
| Database | MongoDB (Atlas) |
| Storage | AWS S3 + CloudFront |
