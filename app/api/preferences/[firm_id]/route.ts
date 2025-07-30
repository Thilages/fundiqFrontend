import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(
  request: NextRequest,
  context: { params: { firm_id: string } }
) {
  const { params } = context;
  const { firm_id } = await params;

  try {
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/vc-firms/${firm_id}/preferences`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${jwtToken}`,
        'X-Forwarded-For': remoteAddress,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No preferences found - return empty array
        return NextResponse.json([]);
      }
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: response.status }
      );
    }

    const preferences = await response.json();
    return NextResponse.json(preferences);
  } catch (error) {
    console.error(`Error in GET /api/preferences/${firm_id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { firm_id: string } }
) {
  try {
    // Get JWT token from cookie
    const jwtToken = request.cookies.get('jwt_token')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { firm_id } = await params;
    const body = await request.json();

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/vc-firms/${firm_id}/preferences`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${jwtToken}`,
        'X-Forwarded-For': remoteAddress,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`,
        errorData
      );
      return NextResponse.json(
        { error: errorData.error || "Failed to create preference" },
        { status: response.status }
      );
    }

    const newPreference = await response.json();
    return NextResponse.json(newPreference, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/preferences/${params.firm_id}:`, error);
    return NextResponse.json(
      { error: "Failed to create preference" },
      { status: 500 }
    );
  }
}
