import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Call Flask backend
    console.log('Calling Flask backend:', `${API_BASE_URL}/auth/login`);
    console.log('Request body:', { username, password: '[REDACTED]', remote_address: remoteAddress });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        remote_address: remoteAddress
      }),
    });

    // Check if response is ok and has JSON content type
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend responded with status: ${response.status}`, errorText);
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Backend did not return JSON response');
      return NextResponse.json(
        { success: false, message: 'Invalid response from server' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Parsed response data:', JSON.stringify(data, null, 2));

    if (data.jwt_token && data.user) {
      console.log('✅ Login successful, setting JWT cookie');
      console.log('🎫 JWT Token to set:', data.jwt_token.substring(0, 20) + '...');
      console.log('👤 User data:', data.user);
      
      // Create response and set JWT token as HTTP-only cookie
      const res = NextResponse.json({
        success: true,
        user: data.user,
        message: 'Login successful'
      });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      };
      
      console.log('🍪 Setting cookie with options:', cookieOptions);
      res.cookies.set('jwt_token', data.jwt_token, cookieOptions);

      return res;
    } else {
      console.error('Backend response validation failed:', {
        hasJwtToken: !!data.jwt_token,
        hasUser: !!data.user,
        responseData: data
      });
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
