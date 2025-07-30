import { ApplicationService } from "@/services";
import { ApplicationDetail, PdfViewResponse } from "./types";

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  const result = await ApplicationService.getApplication(id);

  if (!result.success) {
    if (result.error?.includes("404") || result.error?.includes("not found")) {
      throw new Error("Application not found");
    }
    throw new Error(result.error || "Failed to fetch application");
  }

  return result.data!;
}

export async function getFileViewUrl(
  applicationId: string,
  attachmentId?: string
): Promise<string> {
  const result = await ApplicationService.getFileViewUrl(
    applicationId,
    attachmentId
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to get file view URL");
  }

  if (!result.data?.signed_url) {
    throw new Error("No signed URL received from server");
  }

  return result.data.signed_url;
}
