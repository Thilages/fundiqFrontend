import { API_BASE_URL } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Applications API called');
    console.log('🍪 All cookies:', request.cookies.getAll());
    console.log('📨 Request headers from middleware:', Object.fromEntries(request.headers.entries()));
    
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;
    console.log('🎫 JWT Token found:', jwtToken ? `${jwtToken.substring(0, 20)}...` : 'NO TOKEN');
    
    // Check if Authorization header was added by middleware
    const authHeader = request.headers.get('Authorization');
    console.log('🔑 Authorization header from middleware:', authHeader ? `${authHeader.substring(0, 30)}...` : 'NO AUTH HEADER');

    if (!jwtToken) {
      console.log('❌ No JWT token found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build query parameters for backend
    const params = new URLSearchParams()
    if (status && status !== "all") {
      params.append("status", status)
    }
    if (search) {
      params.append("search", search)
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    const apiUrl = API_BASE_URL
    const response = await fetch(`${apiUrl}/applications?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${jwtToken}`,
        'X-Forwarded-For': remoteAddress,
      },
    })

    if (!response.ok) {
      console.error(`Backend API returned ${response.status}: ${response.statusText}`)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: response.status })
    }

    const applications = await response.json()

    // Calculate status metrics from the data
    const statusMetrics = {
      total: applications.length,
      submitted: applications.filter((app: any) => app.status === "submitted").length,
      completed: applications.filter((app: any) => app.status === "completed").length,
    }

    return NextResponse.json({
      applications,
      status: statusMetrics,
    })
  } catch (error) {
    console.error("Error in /api/applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Applications POST API called');
    
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;
    console.log('🎫 JWT Token found:', jwtToken ? `${jwtToken.substring(0, 20)}...` : 'NO TOKEN');

    if (!jwtToken) {
      console.log('❌ No JWT token found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    
    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    const apiUrl = API_BASE_URL
    const response = await fetch(`${apiUrl}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'X-Forwarded-For': remoteAddress,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    })

    if (!response.ok) {
      console.error(`Backend API returned ${response.status}: ${response.statusText}`)
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json({ error: "Failed to create application" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in POST /api/applications:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
