import { API_BASE_URL } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
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

    const apiUrl = API_BASE_URL
    const response = await fetch(`${apiUrl}/applications?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
