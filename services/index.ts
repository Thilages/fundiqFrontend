// Export all services from a central location
export { BaseService } from "./base.service";
export { AuthService } from "./auth.service";
export { ApplicationService } from "./application.service";
export { PreferenceService } from "./preference.service";

// Export types
export type { ApiResponse } from "./base.service";
export type {
  User,
  LoginRequest,
  AuthResponse,
  SessionResponse,
  ValidationResponse,
} from "./auth.service";
export type {
  ApplicationDetail,
  ApplicationsListResponse,
} from "./application.service";
export type { Preference, PreferenceResponse } from "./preference.service";
