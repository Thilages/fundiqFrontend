import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { valid: false, error: 'No token found' },
        { status: 401 }
      );
    }

    // Call Flask backend to validate token
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        token: jwtToken
      }),
    });

    if (!response.ok) {
      console.error(`Validate backend responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Validate error response:', errorText);
      return NextResponse.json({ valid: false, error: 'Backend error' });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Validate backend did not return JSON response');
      return NextResponse.json({ valid: false, error: 'Invalid response format' });
    }

    const data = await response.json();

    if (data.valid) {
      return NextResponse.json({
        valid: true,
        user_data: {
          user_id: data.user_data.user_id,
          username: data.user_data.username
        }
      });
    } else {
      // If token is invalid, clear the cookie
      const res = NextResponse.json(
        { valid: false, error: data.error || 'Invalid token' },
        { status: 401 }
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
  } catch (error) {
    console.error('Token validation error:', error);
    
    // Clear cookie on error
    const res = NextResponse.json(
      { valid: false, error: 'Token validation failed' },
      { status: 500 }
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
