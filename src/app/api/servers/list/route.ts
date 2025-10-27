import { NextRequest, NextResponse } from 'next/server';
import { getPublicConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const config = getPublicConfig();

    return NextResponse.json({
      success: true,
      data: config.servers,
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
