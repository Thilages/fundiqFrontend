import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Sessions API called');
    console.log('🍪 All cookies:', request.cookies.getAll());
    console.log('📨 Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;
    console.log('🎫 JWT Token found:', jwtToken ? `${jwtToken.substring(0, 20)}...` : 'NO TOKEN');

    if (!jwtToken) {
      console.log('❌ No JWT token found, returning null session');
      return NextResponse.json({
        success: true,
        session: null
      });
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    console.log('🌐 Client IP:', remoteAddress);

    // Call Flask backend to validate the token instead of getting session
    const backendHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'X-Forwarded-For': remoteAddress,
    };
    
    console.log('🚀 Making request to Flask backend:', `${API_BASE_URL}/auth/validate`);
    console.log('📤 Request headers to backend:', backendHeaders);
    console.log('📤 Request body to backend:', JSON.stringify({ token: jwtToken.substring(0, 20) + '...' }));

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({
        token: jwtToken
      }),
    }).catch((fetchError) => {
      console.error('Network error connecting to backend:', fetchError);
      // Return a fake response object for network errors
      return {
        ok: false,
        status: 0,
        headers: new Headers(),
        text: async () => `Network error: ${fetchError.message}`
      } as Response;
    });

    console.log('Sessions response status:', response.status);
    console.log('Sessions response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is ok and has JSON content type
    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`);
      if (response.status === 0) {
        console.error('Backend is not reachable. Make sure Flask backend is running on:', API_BASE_URL);
      }
      const errorText = await response.text();
      console.error('Sessions error response:', errorText);
      
      // If no session found on backend, clear the cookie
      const res = NextResponse.json({
        success: true,
        session: null
      });

      res.cookies.set('jwt_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return res;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Backend did not return JSON response for sessions');
      console.error('Content-Type received:', contentType);
      const responseText = await response.text();
      console.error('Non-JSON response body:', responseText.substring(0, 500)); // Log first 500 chars
      
      const res = NextResponse.json({
        success: true,
        session: null
      });

      res.cookies.set('jwt_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return res;
    }

    const data = await response.json();
    console.log('Sessions response data:', data);

    if (data.valid && data.user_data) {
      return NextResponse.json({
        success: true,
        session: {
          jwt_token: jwtToken,
          user: {
            id: data.user_data.user_id,
            username: data.user_data.username
          }
        }
      });
    } else {
      // If no session found on backend, clear the cookie
      const res = NextResponse.json({
        success: true,
        session: null
      });

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
    console.error('Get session error:', error);
    
    // Clear cookie on error
    const res = NextResponse.json({
      success: true,
      session: null
    });

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
