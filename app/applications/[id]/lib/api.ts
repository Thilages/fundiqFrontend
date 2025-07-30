import { ApplicationService } from "@/services";
import { ApplicationDetail } from "./types";

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
