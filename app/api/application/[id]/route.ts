import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

// Mock detailed application data for multiple applications
const mockApplicationDetails: { [key: string]: any } = {
  "app-001": {
    id: "app-001",
    startup_name: "Zeron Cybersecurity",
    contact_email: "founders@zeron.one",
    contact_name: "Sanket Sarkar",
    website_url: "https://zeron.one",
    status: "completed",
    created_at: "2024-01-15T10:30:00Z",
    last_updated_at: "2024-01-20T14:45:00Z",

    // Issues/Notes
    issues: [
      {
        id: "issue-1",
        type: "warning",
        category: "Market",
        description:
          "Missing TAM/SAM data in market section - requires manual verification",
        status: "open",
        created_at: "2024-01-16T09:15:00Z",
      },
      {
        id: "issue-2",
        type: "error",
        category: "Founders",
        description: "Failed to extract founder LinkedIn profiles from PDF",
        status: "in_progress",
        created_at: "2024-01-16T10:30:00Z",
      },
      {
        id: "issue-3",
        type: "info",
        category: "Market",
        description: "Successfully enriched market data with external sources",
        status: "resolved",
        created_at: "2024-01-17T11:45:00Z",
        resolved_at: "2024-01-17T11:45:00Z",
      },
    ],

    // Raw extracted data
    raw: {
      company_website: "https://zeron.one",
      contact_info: {
        emails: ["founders@zeron.one"],
        phone_numbers: ["+91-7980700938"],
      },
      founders: [
        {
          name: "SANKET SARKAR",
          current_designation: "FOUNDER",
          roles: ["FOUNDER"],
          domain_alignment: true,
          is_repeat_founder: false,
          total_experience_years: 0,
          education: [],
          work_history: [],
          linkedin_url: "null",
          age_estimate: "null",
          background_type: "null",
          co_founder_overlap: {
            shared_employers: [],
            shared_universities: [],
          },
        },
        {
          name: "SWARNALI SINGHA",
          current_designation: "CO-FOUNDER & CBO",
          roles: ["CO-FOUNDER", "CBO"],
          domain_alignment: true,
          is_repeat_founder: false,
          total_experience_years: 0,
          education: [],
          work_history: [],
          linkedin_url: "null",
          age_estimate: "null",
          background_type: "null",
          co_founder_overlap: {
            shared_employers: [],
            shared_universities: [],
          },
        },
        {
          name: "SNEHANJAN CHATTERJEE",
          current_designation: "CO-FOUNDER & COO",
          roles: ["CO-FOUNDER", "COO"],
          domain_alignment: true,
          is_repeat_founder: false,
          total_experience_years: 0,
          education: [],
          work_history: [],
          linkedin_url: "null",
          age_estimate: "null",
          background_type: "null",
          co_founder_overlap: {
            shared_employers: [],
            shared_universities: [],
          },
        },
        {
          name: "SANTOSH KUMAR JHA",
          current_designation: "CO-FOUNDER & CTO",
          roles: ["CO-FOUNDER", "CTO"],
          domain_alignment: true,
          is_repeat_founder: false,
          total_experience_years: 0,
          education: [],
          work_history: [],
          linkedin_url: "null",
          age_estimate: "null",
          background_type: "null",
          co_founder_overlap: {
            shared_employers: [],
            shared_universities: [],
          },
        },
      ],
      investors: {
        advisors: [
          {
            name: "VENU NAIR",
            background:
              "Former COO at RMSI Group, Former Chief Strategy Officer at Safe Security",
          },
          {
            name: "GAURAV BATRA",
            background:
              "Co-Founder at Semaai, Backed by Sequoia Surge & Beenext",
          },
        ],
        co_investors: [],
      },
      market: {
        sam: "$15B",
        som: "$1.1B",
        tam: "$256B",
        target_geography: "null",
        problem_statement:
          "Cybersecurity Trust Gaps exists on many levels across the corporate ecosystem.",
        regulatory_domain: [],
        competitive_landscape: "null",
      },
      product: {
        tech_stack: [],
        description:
          "A complete scalable, adaptive, automated cybersecurity platform powered by artificial intelligence.",
        is_scalable: true,
        innovation_or_ip: "null",
        product_market_fit: "null",
      },
      traction: {
        gmv: 0,
        users: 0,
        revenue: 70700,
        growth_rate: "null",
        current_customers: ["AMANISystems"],
        business_model: "null",
        revenue_model: "null",
        retention_metrics: "null",
      },
      vision: {
        vision: "null",
        mission: "null",
        differentiation: "null",
        resilience_signal: "null",
      },
    },

    // Enriched data
    enriched: {
      market: {
        tam: "Global cybersecurity market valued at $878.48B by 2034",
        sam: "AI in cybersecurity market projection valued at $93.75B by 2030",
        summary:
          "Operating in the $878B cybersecurity market, Zeron targets the $93B AI-driven risk quantification segment.",
        confidence: 92,
      },
      vision: {
        vision:
          "Become the single point of truth for cyber risk management in organizations",
        mission:
          "To empower risk owners to make informed cyber risk decisions through data-driven insights",
        summary:
          "Zeron positions itself as an integrated cyber risk command center.",
        confidence: 95,
      },
      product: {
        summary: "Architected as cloud-native SaaS with API-first design.",
        confidence: 89,
        description:
          "AI-powered Cyber Risk Posture Management (CRPM) platform with modular capabilities.",
        is_scalable: true,
      },
      founders: [
        {
          name: "Sanket Sarkar",
          summary:
            "Cybersecurity entrepreneur with dual technical-risk management expertise, certified in FAIR framework.",
          confidence: 90,
        },
      ],
      traction: {
        revenue: "Disclosed: $70,700 (2023), Projected: $1.2M ARR (2025)",
        growth_rate: "200% YoY (Claimed)",
        current_customers: [
          "Aditya Birla Sunlife AMC",
          "Finova Capital",
          "Spandana Sphoorty Financial",
        ],
        confidence: 85,
      },
      investors: {
        summary: "$650K total raised through seed rounds.",
        advisors: ["Ajeesh Achuthan", "Venkata Ramana"],
        confidence: 88,
      },
    },

    // Overall evaluation data
    overall: {
      score: 7.2,
      summary:
        "Strong technical team with proven domain expertise in cybersecurity. Market opportunity is significant with a large TAM, but competitive landscape requires careful positioning. Product demonstrates clear scalability and innovation with AI-powered features. Traction shows early revenue generation but needs acceleration for Series A readiness. Vision is well-articulated with clear differentiation strategy. Investment backing is solid but requires stronger institutional presence for next funding round.",
      dimensions: {
        founders: {
          score: 8.5,
          summary:
            "Experienced team with strong cybersecurity background and complementary skills. Domain expertise is evident with proven track record.",
          confidence: 90,
        },
        market: {
          score: 7.8,
          summary:
            "Large addressable market with clear problem-solution fit in cybersecurity space. Competitive but growing rapidly.",
          confidence: 85,
        },
        product: {
          score: 7.2,
          summary:
            "Innovative AI-powered platform with demonstrated scalability and technical differentiation. Strong IP potential.",
          confidence: 88,
        },
        traction: {
          score: 6.5,
          summary:
            "Early revenue traction with enterprise clients, growth trajectory promising but needs acceleration for scale.",
          confidence: 82,
        },
        vision: {
          score: 7.0,
          summary:
            "Clear vision for cyber risk management leadership with strong differentiation strategy and market positioning.",
          confidence: 87,
        },
        investors: {
          score: 6.8,
          summary:
            "Solid seed funding with strategic advisors, needs stronger institutional backing for next growth phase.",
          confidence: 80,
        },
      },
    },
  },

  "app-002": {
    id: "app-002",
    startup_name: "FinTech Solutions",
    contact_email: "contact@fintechsolutions.com",
    contact_name: "Sarah Johnson",
    website_url: "https://fintechsolutions.com",
    status: "submitted",
    created_at: "2024-01-14T08:15:00Z",
    last_updated_at: "2024-01-14T08:15:00Z",

    // Issues/Notes
    issues: [
      {
        id: "issue-1",
        type: "warning",
        category: "General",
        description: "Application submitted but evaluation not yet started",
        status: "open",
        created_at: "2024-01-14T08:15:00Z",
      },
    ],

    // Raw extracted data
    raw: {
      market: {
        sam: "$45B",
        som: "$2.3B",
        tam: "$180B",
        target_geography: "North America",
        problem_statement:
          "Traditional banking systems lack modern digital payment solutions for SMEs.",
        regulatory_domain: ["PCI DSS", "SOX"],
        competitive_landscape: "Stripe, Square, PayPal",
      },
      vision: {
        vision: "Democratize financial services for small businesses",
        mission: "Enable seamless digital payments for every business",
        differentiation: "AI-powered fraud detection with 99.9% accuracy",
        resilience_signal:
          "Diversified revenue streams across multiple verticals",
      },
      product: {
        tech_stack: ["Node.js", "React", "PostgreSQL", "AWS"],
        description:
          "Comprehensive payment processing platform with integrated accounting and analytics.",
        is_scalable: true,
        innovation_or_ip:
          "Patent pending on real-time fraud detection algorithm",
        product_market_fit:
          "Strong PMF evidenced by 40% month-over-month growth",
      },
      founders: [
        {
          name: "SARAH JOHNSON",
          roles: ["CEO", "FOUNDER"],
          education: ["MBA Stanford", "BS Computer Science MIT"],
          current_designation: "CEO & Co-Founder",
          domain_alignment: true,
          is_repeat_founder: true,
          total_experience_years: 12,
        },
        {
          name: "MIKE CHEN",
          roles: ["CTO", "FOUNDER"],
          education: ["MS Computer Science Carnegie Mellon"],
          current_designation: "CTO & Co-Founder",
          domain_alignment: true,
          is_repeat_founder: false,
          total_experience_years: 8,
        },
      ],
      traction: {
        gmv: 2500000,
        users: 1250,
        revenue: 125000,
        growth_rate: "40% MoM",
        current_customers: [
          "Local Coffee Co",
          "Tech Startup Inc",
          "Retail Plus",
        ],
      },
      investors: {
        advisors: [
          "John Smith - Former PayPal VP",
          "Lisa Wong - Fintech Expert",
        ],
        co_investors: ["Seed Fund Alpha", "Angel Network Beta"],
      },
    },

    // Enriched data
    enriched: {
      market: {
        tam: "Global fintech market projected to reach $324B by 2026",
        sam: "SME payment processing market valued at $45B in North America",
        summary:
          "Operating in the rapidly growing fintech space with strong focus on underserved SME segment. Market timing is excellent with digital transformation acceleration.",
        confidence: 88,
      },
      vision: {
        vision:
          "Become the leading payment infrastructure for small and medium businesses globally",
        mission:
          "Simplify financial operations for businesses through intelligent automation",
        summary:
          "Clear vision with strong market positioning. Differentiation through AI-powered features creates competitive moat.",
        confidence: 92,
      },
      product: {
        summary:
          "Well-architected platform with modern tech stack. Strong product-market fit indicators and scalable infrastructure.",
        confidence: 91,
        description:
          "Comprehensive fintech platform combining payment processing, fraud detection, and business analytics in unified solution.",
        is_scalable: true,
      },
      founders: [
        {
          name: "Sarah Johnson",
          summary:
            "Experienced fintech executive with strong educational background and previous startup success. Ideal founder-market fit.",
          confidence: 95,
        },
        {
          name: "Mike Chen",
          summary:
            "Strong technical leader with relevant experience in payment systems and fraud detection technologies.",
          confidence: 88,
        },
      ],
      traction: {
        revenue:
          "Strong revenue growth: $125K ARR with 40% month-over-month growth trajectory",
        growth_rate:
          "Exceptional growth metrics indicating strong product-market fit",
        current_customers:
          "Diversified customer base across multiple business verticals",
        confidence: 93,
      },
      investors: {
        summary:
          "Strong advisory team with relevant fintech expertise and established investor backing",
        advisors: [
          "John Smith - Former PayPal VP with 15+ years fintech experience",
        ],
        confidence: 85,
      },
    },

    // Overall evaluation data (not available for submitted status)
    overall: null,
  },

  "app-003": {
    id: "app-003",
    startup_name: "HealthAI Platform",
    contact_email: "contact@healthai.com",
    contact_name: "Dr. Michael Chen",
    website_url: "https://healthai.com",
    status: "completed",
    created_at: "2024-01-13T14:20:00Z",
    last_updated_at: "2024-01-18T16:30:00Z",

    // Issues/Notes
    issues: [
      {
        id: "issue-1",
        type: "info",
        category: "Product",
        description: "FDA approval pathway clearly defined and on track",
        status: "resolved",
        created_at: "2024-01-15T10:00:00Z",
        resolved_at: "2024-01-15T10:00:00Z",
      },
    ],

    // Raw and enriched data would be similar structure...
    raw: {
      market: {
        sam: "$25B",
        som: "$1.8B",
        tam: "$120B",
        target_geography: "US, EU",
        problem_statement:
          "Healthcare diagnosis inefficiencies lead to delayed treatment and higher costs.",
        regulatory_domain: ["FDA", "HIPAA", "GDPR"],
        competitive_landscape: "IBM Watson Health, Google Health AI",
      },
      // ... other dimensions
    },

    enriched: {
      market: {
        tam: "Global healthcare AI market expected to reach $120B by 2028",
        sam: "Medical imaging AI segment valued at $25B",
        summary:
          "Large and rapidly growing market with clear regulatory pathway and strong demand drivers.",
        confidence: 90,
      },
      // ... other dimensions
    },

    overall: {
      score: 8.1,
      summary:
        "Exceptional healthcare AI platform with strong clinical validation and clear regulatory pathway. Experienced medical founder with deep domain expertise. Large market opportunity with significant barriers to entry creating competitive moat.",
      dimensions: {
        founders: {
          score: 9.2,
          summary:
            "World-class medical expertise with proven track record in healthcare innovation.",
          confidence: 95,
        },
        market: {
          score: 8.5,
          summary:
            "Large healthcare AI market with strong growth drivers and clear demand.",
          confidence: 90,
        },
        product: {
          score: 8.8,
          summary:
            "Clinically validated AI platform with clear FDA approval pathway and strong IP.",
          confidence: 92,
        },
        traction: {
          score: 7.2,
          summary:
            "Strong pilot results with major health systems, revenue generation starting.",
          confidence: 85,
        },
        vision: {
          score: 8.0,
          summary:
            "Clear vision for transforming healthcare diagnosis with measurable impact goals.",
          confidence: 88,
        },
        investors: {
          score: 7.8,
          summary:
            "Strong healthcare-focused investors with relevant expertise and network.",
          confidence: 87,
        },
      },
    },
  },
};

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

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/applications/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "X-Forwarded-For": remoteAddress,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to fetch application" },
        { status: response.status }
      );
    }

    const application = await response.json();
    return NextResponse.json(application);
  } catch (error) {
    console.error(`Error in /api/application/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const action = searchParams.get("action");
    const preferencesId = searchParams.get("preferences_id");

    if (!action) {
      return NextResponse.json(
        { error: "Action parameter is required" },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Build the API URL with query parameters
    let apiUrl = `${API_BASE_URL}/applications/${id}?action=${action}`;
    if (preferencesId) {
      apiUrl += `&preferences_id=${preferencesId}`;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "X-Forwarded-For": remoteAddress,
      },
    });

    if (!response.ok) {
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        {
          error: `Failed to trigger ${action}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in POST /api/application/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to trigger action" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Check if the request contains FormData (for file uploads) or JSON
    const contentType = request.headers.get("content-type") || "";
    let body: any;
    let headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${jwtToken}`,
      "X-Forwarded-For": remoteAddress,
    };

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      body = await request.formData();
      // Don't set Content-Type for FormData, let browser set it with boundary
    } else {
      // Handle JSON data
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/applications/${id}`, {
      method: "PATCH",
      headers,
      body,
    });

    if (!response.ok) {
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: response.status }
      );
    }

    const updatedApplication = await response.json();
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error(`Error in PATCH /api/application/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    const apiUrl = API_BASE_URL;
    const response = await fetch(`${apiUrl}/applications/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "X-Forwarded-For": remoteAddress,
      },
    });

    if (!response.ok) {
      console.error(
        `Backend API returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: response.status }
      );
    }

    // Return success response (DELETE might return empty body)
    try {
      const result = await response.json();
      return NextResponse.json(result);
    } catch {
      // If no JSON response, return success
      return NextResponse.json({
        success: true,
        message: "Application deleted successfully",
      });
    }
  } catch (error) {
    console.error(`Error in DELETE /api/application/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
