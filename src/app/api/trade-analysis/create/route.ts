import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Create a new FormData instance for the backend API
    const backendFormData = new FormData();
    
    // Get required fields
    const chart_image = formData.get('chart_image');
    const currency_pair = formData.get('currency_pair');
    const timeframe = formData.get('timeframe');
    const trade_direction = formData.get('trade_direction');
    const additional_context = formData.get('additional_context');
    
    // Add required fields
    if (!chart_image || !(chart_image instanceof File)) {
      return NextResponse.json(
        { error: 'Chart image is required' },
        { status: 400 }
      );
    }
    
    if (!currency_pair || !timeframe) {
      return NextResponse.json(
        { error: 'Currency pair and timeframe are required' },
        { status: 400 }
      );
    }
    
    backendFormData.append('chart_image', chart_image);
    backendFormData.append('currency_pair', currency_pair as string);
    backendFormData.append('timeframe', timeframe as string);
    
    // Add optional fields
    if (trade_direction) {
      backendFormData.append('trade_direction', trade_direction as string);
    }
    
    if (additional_context) {
      backendFormData.append('additional_context', additional_context as string);
    }
    
    console.log('Sending to backend:', {
      currency_pair: currency_pair,
      timeframe: timeframe,
      trade_direction: trade_direction,
      additional_context: additional_context,
      has_image: !!chart_image
    });
    
    const response = await fetch(`${API_URL}/api/v1/trade-review/analyze`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData || 'Failed to create trade analysis' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating trade analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}