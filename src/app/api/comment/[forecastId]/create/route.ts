import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { forecastId: string } }
) {
  try {
    const body = await request.json();
    
    // APIの仕様に合わせてリクエストボディを構築
    const commentData = {
      content: body.content,
      comment_type: body.comment_type || 'note', // デフォルトは 'note'
      forecast_id: parseInt(params.forecastId),
      parent_comment_id: body.parent_comment_id || null,
      extra_metadata: body.extra_metadata || null
    };
    
    const response = await fetch(`${API_URL}/api/v1/comments/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to create comment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}