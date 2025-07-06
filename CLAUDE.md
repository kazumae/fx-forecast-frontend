# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FX Forecast Frontend - A foreign exchange forecast and trade analysis application built with Next.js 15. The application provides tools for multi-timeframe chart analysis, trade reviews, and AI-assisted insights.

## Commands

### Development
```bash
npm run dev        # Start development server on port 3010
npm run lint       # Run ESLint with Next.js rules
```

### Build & Production
```bash
npm run build      # Build production bundle
npm run start      # Start production server on port 3010
```

## Architecture

### Tech Stack
- **Next.js 15.3.4** with App Router
- **React 19.0.0**
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** (PostCSS configuration, no tailwind.config.js)
- **ESLint 9** with flat config format

### Backend Integration

The frontend communicates with a backend API at `http://localhost:8767`. All API calls go through Next.js API routes that act as proxies:

```typescript
// Frontend component calls
fetch('/api/analysis/analyze')

// API route proxies to backend
fetch('http://localhost:8767/api/v1/analysis/analyze/v2')
```

Configuration is in `src/lib/config.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8767';
```

### Key Features & API Endpoints

1. **Analysis Module** (`/analysis`)
   - Multi-timeframe chart analysis (1m, 5m, 15m, 1h, 4h, daily)
   - History viewing with pagination
   - Image storage and retrieval

2. **Trade Analysis Module** (`/trade-analysis`)
   - Trade review with AI scoring
   - Entry point analysis
   - Good points, improvement points, and recommendations
   - Uses `/api/v1/trade-review/` backend endpoints

3. **Review System**
   - Post-trade reviews with actual outcomes
   - Multiple image uploads per review
   - Integrates with forecast history

4. **Comment System**
   - Questions and notes on analyses
   - AI-powered responses
   - Analysis update capability based on AI feedback

### Currency Pair Handling

Currency pairs use different formats:
- **Display**: `USD/JPY`, `EUR/USD` (with slash)
- **API**: `USDJPY`, `EURUSD` (no slash)
- **Special**: `XAUUSD` (gold) remains unchanged

Conversion happens in components:
```typescript
const formatCurrencyPair = (pair: string) => {
  if (pair === 'XAUUSD') return pair;
  if (pair.length === 6) {
    return `${pair.slice(0, 3)}/${pair.slice(3)}`;
  }
  return pair;
};
```

### Date/Time Handling

All timestamps are displayed in Japanese timezone (Asia/Tokyo):
```typescript
// src/lib/utils/date.ts provides utilities
formatDateTime(date)  // 2024-01-15 14:30:00
formatDate(date)      // 2024-01-15
formatTime(date)      // 14:30:00
```

### Component Architecture

- **Client Components**: Use `'use client'` directive
- **Server Components**: Default in App Router
- **API Routes**: Handle backend proxy and data transformation
- **Common Components**: ImageModal, date utilities

### Environment Setup

Create `.env.local` from `.env.local.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8767
```

### Important Patterns

1. **Form Data Handling**: Use FormData for file uploads
2. **Error States**: Display user-friendly error messages
3. **Loading States**: Show loading indicators during API calls
4. **Image Handling**: Support for multiple image formats with preview
5. **Pagination**: Implemented for list views

### Port Configuration

The application runs on port 3010 (not the default 3000). This is configured in package.json scripts.