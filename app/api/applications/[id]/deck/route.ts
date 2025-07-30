import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get JWT token from cookie
    const jwtToken = request.cookies.get("jwt_token")?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachment_id");

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Build the API URL
    let apiUrl = `${API_BASE_URL}/applications/${id}/deck`;
    if (attachmentId) {
      apiUrl += `?attachment_id=${attachmentId}`;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "X-Forwarded-For": remoteAddress,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to get deck view URL" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in /api/applications/${params.id}/deck:`, error);
    return NextResponse.json(
      { error: "Failed to get deck view URL" },
      { status: 500 }
    );
  }
}
