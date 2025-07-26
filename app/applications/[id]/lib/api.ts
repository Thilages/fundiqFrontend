import { ApplicationDetail } from "./types";

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  try {
    const response = await fetch(`/api/application/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Application not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched application:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch application:", error);
    throw error;
  }
}
