// pitchdeck/app/applications/[id]/lib/pdf-viewer.ts

/**
 * Get file view URL for PDF viewing
 * Based on your backend implementation
 */
export async function getFileViewUrl(
  applicationId: string,
  attachmentId: string | null = null
): Promise<string> {
  try {
    const url = new URL(
      `/api/applications/${applicationId}/deck`,
      window.location.origin
    );

    if (attachmentId) {
      url.searchParams.set("attachment_id", attachmentId);
    }
    // Note: No 'download=true' parameter for viewing

    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // Include cookies for JWT token
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      // Returns signed URL for viewing
      return result.signed_url; // Valid for 1 hour
    }

    throw new Error(result.error || "Failed to get view URL");
  } catch (error) {
    console.error("Error getting view URL:", error);
    throw error;
  }
}

/**
 * Open PDF in a new window/tab
 */
export async function openPdfInNewTab(
  applicationId: string,
  attachmentId: string | null = null
): Promise<void> {
  try {
    const signedUrl = await getFileViewUrl(applicationId, attachmentId);
    window.open(signedUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Failed to open PDF:", error);
    throw error;
  }
}

/**
 * Get PDF URL for embedding in iframe
 */
export async function getPdfEmbedUrl(
  applicationId: string,
  attachmentId: string | null = null
): Promise<string> {
  const signedUrl = await getFileViewUrl(applicationId, attachmentId);
  // Some browsers require specific parameters for iframe embedding
  return signedUrl;
}
