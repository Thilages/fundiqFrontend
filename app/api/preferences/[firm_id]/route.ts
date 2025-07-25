import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(
  request: NextRequest,
  context: { params: { firm_id: string } }
) {
  const { params } = context;
  const { firm_id } = await params;

  try {
    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/vc-firms/${firm_id}/preferences`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
    const { firm_id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.preference_name || !body.custom_rules_text || !body.weights) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: preference_name, custom_rules_text, and weights are required",
        },
        { status: 400 }
      );
    }

    // Validate weights structure
    const requiredDimensions = [
      "founders",
      "product",
      "market",
      "vision",
      "traction",
      "investors",
    ];
    const providedDimensions = Object.keys(body.weights);

    if (!requiredDimensions.every((dim) => providedDimensions.includes(dim))) {
      return NextResponse.json(
        {
          error:
            "Invalid weights structure. Required: founders, product, market, vision, traction, investors",
        },
        { status: 400 }
      );
    }

    // Validate weight values are numbers between 0-100
    for (const [key, value] of Object.entries(body.weights)) {
      if (typeof value !== "number" || value < 0 || value > 100) {
        return NextResponse.json(
          {
            error: `Invalid weight value for ${key}. Must be a number between 0-100`,
          },
          { status: 400 }
        );
      }
    }

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/vc-firms/${firm_id}/preferences`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preference_name: body.preference_name.trim(),
        custom_rules_text: body.custom_rules_text.trim(),
        weights: body.weights,
      }),
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
