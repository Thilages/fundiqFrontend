import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, message: 'No active session found' },
        { status: 401 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Call Flask backend
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Forwarded-For': remoteAddress,
      },
      body: JSON.stringify({
        remote_address: remoteAddress,
        jwt_token: jwtToken
      }),
    });

    if (!response.ok) {
      console.error(`Logout backend responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Logout error response:', errorText);
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      console.error('Logout backend did not return JSON response');
      data = { success: true, message: 'Logged out successfully' };
    }

    // Create response and clear JWT cookie
    const res = NextResponse.json({
      success: data.success,
      message: data.message || 'Logged out successfully'
    });

    // Clear the JWT cookie
    res.cookies.set('jwt_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if backend call fails, clear the cookie
    const res = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    res.cookies.set('jwt_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return res;
  }
}
