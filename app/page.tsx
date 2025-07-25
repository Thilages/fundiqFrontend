"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FileText, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useState,useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { API_BASE_URL } from "@/lib/config"

// Types
interface Application {
  id: string
  companyName: string
  contact_name?: string
  contact_email?: string
  status: "submitted" | "completed" | "incomplete"
  overallScore?: number
  submittedAt: string
  industry?: string
}

interface DashboardMetrics {
  total: number
  submitted: number
  completed: number
}

interface ApiResponse {
  applications: Application[]
  status: DashboardMetrics
}

// Add New Application Modal Component
function AddNewApplicationModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    startup_name: "",
    contact_name: "",
    contact_email: "",
    website_url: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Startup name validation
    if (!formData.startup_name.trim()) {
      newErrors.startup_name = "Startup name is required"
    } else if (formData.startup_name.length > 100) {
      newErrors.startup_name = "Startup name must be less than 100 characters"
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(formData.startup_name)) {
      newErrors.startup_name = "Startup name contains invalid characters"
    }

    // Contact name validation
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "Contact name is required"
    } else if (formData.contact_name.length > 50) {
      newErrors.contact_name = "Contact name must be less than 50 characters"
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.contact_name)) {
      newErrors.contact_name = "Contact name contains invalid characters"
    }

    // Email validation
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required"
    } else if (formData.contact_email.length > 100) {
      newErrors.contact_email = "Email must be less than 100 characters"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address"
    }

    // Website URL validation
    if (!formData.website_url.trim()) {
      newErrors.website_url = "Website URL is required"
    } else if (formData.website_url.length > 200) {
      newErrors.website_url = "Website URL must be less than 200 characters"
    } else if (!/^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/.test(formData.website_url)) {
      newErrors.website_url = "Please enter a valid website URL"
    }

    // File validation
    if (!file) {
      newErrors.file = "Pitch deck file is required"
    } else if (file.type !== "application/pdf") {
      newErrors.file = "Only PDF files are allowed"
    } else if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      newErrors.file = "File size must be less than 10MB"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append("startup_name", formData.startup_name.trim())
      submitFormData.append("contact_name", formData.contact_name.trim())
      submitFormData.append("contact_email", formData.contact_email.trim())
      submitFormData.append("website_url", formData.website_url.trim())
      if (file) {
        submitFormData.append("file", file)
      }

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        body: submitFormData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "Application created successfully",
      })

      // Reset form
      setFormData({
        startup_name: "",
        contact_name: "",
        contact_email: "",
        website_url: "",
      })
      setFile(null)
      setErrors({})
      setIsOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to create application:", error)
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>Create a new pitch deck application</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startup_name">Startup Name *</Label>
            <Input
              id="startup_name"
              value={formData.startup_name}
              onChange={(e) => updateField("startup_name", e.target.value)}
              placeholder="Enter startup name"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.startup_name && <p className="text-sm text-red-600">{errors.startup_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => updateField("contact_name", e.target.value)}
              placeholder="Enter contact person name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.contact_name && <p className="text-sm text-red-600">{errors.contact_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => updateField("contact_email", e.target.value)}
              placeholder="Enter contact email"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.contact_email && <p className="text-sm text-red-600">{errors.contact_email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL *</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => updateField("website_url", e.target.value)}
              placeholder="Enter website URL"
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.website_url && <p className="text-sm text-red-600">{errors.website_url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Pitch Deck (PDF) *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null
                setFile(selectedFile)
                if (errors.file) {
                  setErrors({ ...errors, file: "" })
                }
              }}
              disabled={isSubmitting}
            />
            {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// API functions using live API
async function fetchApplications(filters?: {
  status?: string
  search?: string
}): Promise<ApiResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status)
    }
    if (filters?.search) {
      params.append("search", filters.search)
    }

    const response = await fetch(`${API_BASE_URL}/applications?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add timeout for external API
      signal: AbortSignal.timeout(30000), // 30 second timeout for potentially slow API
    })

    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response")
      throw new Error("Invalid response format")
    }

    const data = await response.json()
    console.log("Successfully fetched from live API:", data)

    // Transform the API response to match our interface
    const transformedApplications = data.map((app: any) => ({
      id: app.id,
      companyName: app.startup_name || "Unknown Company",
      contact_name: app.contact_name,
      contact_email: app.contact_email,
      status: app.status || "submitted",
      overallScore: app.score || null,
      submittedAt: app.created_at
        ? new Date(app.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      industry: app.industry || "Unknown",
    }))

    // Calculate metrics from the data
    const statusMetrics = {
      total: transformedApplications.length,
      submitted: transformedApplications.filter((app: Application) => app.status === "submitted").length,
      completed: transformedApplications.filter((app: Application) => app.status === "completed").length,
    }

    return {
      applications: transformedApplications,
      status: statusMetrics,
    }
  } catch (error) {
    console.error("Error in /api/applications:", error)
    throw new Error("Failed to fetch applications")
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "submitted":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

function getStatusBadge(status: string) {
  const variants = {
    completed: "default",
    submitted: "secondary",
    incomplete: "destructive",
  } as const

  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function Dashboard() {
  const [applications, setapplications] = useState<Application[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total: 0,
    submitted: 0,
    completed: 0,
  })
  let error: string | null = null

  const handleApplications = async () => {
    try {
      const result = await fetchApplications();
      setapplications(result.applications);
      setMetrics(result.status);
    } catch (err) {
      console.error("Dashboard error:", err);
      error =
        "Failed to load applications. Please check if the API is available.";
    }
  }
  
  useEffect(() => {
    handleApplications();
  }, []);

  const recentApplications = applications.slice(0, 4) // Get 4 most recent

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2 min-w-0">
        <div className="flex items-center space-x-2 min-w-0">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight truncate">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <AddNewApplicationModal onSuccess={() => window.location.reload()} />
          {/* API Status Indicator */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`}></div>
            <span>{error ? "API Error" : "Live Data"}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">All submitted applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.submitted}</div>
            <p className="text-xs text-muted-foreground">Awaiting evaluation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completed}</div>
            <p className="text-xs text-muted-foreground">Evaluation completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {!error && applications.length > 0 && (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest pitch deck submissions and their evaluation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg min-w-0">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {getStatusIcon(app.status)}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-sm font-medium leading-none hover:underline block truncate"
                      >
                        {app.companyName}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        Contact: {app.contact_name || "Not provided"} • {app.contact_email || "Not provided"}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">Submitted: {app.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {app.overallScore && <Badge variant="outline">Score: {app.overallScore}</Badge>}
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Applications Table */}
      {!error && applications.length > 0 && <ApplicationsTable applications={applications} />}

      {/* Empty State */}
      {!error && applications.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-muted-foreground">No pitch deck applications found.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Client component for interactive table
function ApplicationsTable({ applications }: { applications: Application[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>All Applications</CardTitle>
        <CardDescription>Complete list of pitch deck submissions with search and filter</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Search and Filter Controls */}
        <div className="flex items-center space-x-4 mb-6 p-6 pb-0">
          <div className="relative flex-1 max-w-sm min-w-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search companies or founders..." className="pl-8" />
          </div>
          <Select>
            <SelectTrigger className="w-[180px] flex-shrink-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Company</TableHead>
                <TableHead className="min-w-[120px]">Contact Name</TableHead>
                <TableHead className="min-w-[180px]">Contact Email</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[80px]">Score</TableHead>
                <TableHead className="min-w-[120px]">Submission Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
                    >
                      {app.companyName}
                    </Link>
                  </TableCell>
                  <TableCell className="truncate">{app.contact_name || "Not provided"}</TableCell>
                  <TableCell className="truncate">{app.contact_email || "Not provided"}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {app.overallScore ? (
                      <Badge variant="outline">{app.overallScore}/10</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{app.submittedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
