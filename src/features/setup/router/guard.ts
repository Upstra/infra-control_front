import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { setupApi } from "../api";

export const setupGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.path.startsWith("/setup/")) {
    return next();
  }

  if (localStorage.getItem("setup_skipped") === "true") {
    return next();
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return next();
    }

    const setupStatus = await setupApi.getStatus();

    if (setupStatus.isFirstSetup && setupStatus.currentStep !== "complete") {
      if (setupStatus.isCurrentUserAdmin) {
        return next(`/setup/${setupStatus.currentStep}`);
      }
    }

    next();
  } catch (error) {
    console.error("Setup guard error:", error);
    next();
  }
};
