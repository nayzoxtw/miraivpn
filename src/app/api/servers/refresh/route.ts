import { NextRequest, NextResponse } from 'next/server';
import { getServersWithMetrics } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  try {
    // Check admin key
    const authHeader = request.headers.get('x-admin-key');
    if (authHeader !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Force refresh metrics
    const servers = await getServersWithMetrics(true);

    return NextResponse.json({
      success: true,
      data: servers,
      message: 'Metrics refreshed successfully',
    });
  } catch (error) {
    console.error('Error refreshing servers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
