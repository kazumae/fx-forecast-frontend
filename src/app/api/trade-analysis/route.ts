import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const response = await fetch(
      `${API_URL}/api/v1/trade-review/?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to fetch trade reviews' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the response to match our frontend format
    const transformedData = {
      analyses: data.reviews || [],
      total_pages: Math.ceil(data.total / parseInt(limit)),
      current_page: parseInt(page),
      total_count: data.total
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching trade analyses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}