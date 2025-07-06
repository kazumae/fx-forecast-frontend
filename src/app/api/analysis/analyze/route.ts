import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Create new FormData for backend request
    const backendFormData = new FormData();
    
    // Transfer all files from the request
    const fileFields = ['timeframe_1m', 'timeframe_5m', 'timeframe_15m', 'timeframe_1h', 'timeframe_4h', 'timeframe_d1'];
    
    for (const field of fileFields) {
      const file = formData.get(field);
      if (file && file instanceof File) {
        backendFormData.append(field, file);
      }
    }

    // Make request to backend API
    const response = await fetch(API_ENDPOINTS.analysis.analyze, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}