import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    
    // TODO: Replace with actual API call when backend is ready
    // const response = await fetch(`${API_URL}/api/v1/trade-analysis/image/${imageId}`, {
    //   method: 'GET',
    // });

    // Return a placeholder image for now
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">
          Chart Image ${imageId}
        </text>
        <text x="200" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">
          (Placeholder)
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}