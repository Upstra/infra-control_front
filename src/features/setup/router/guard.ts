import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { setupApi } from '../api';
import { SetupStep } from '../types';

export const setupGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  if (to.path.startsWith('/setup/')) {
    return next();
  }

  // Check if setup was completed or skipped
  const setupCompleted = localStorage.getItem('setup_completed') === 'true';
  const setupSkipped = localStorage.getItem('setup_skipped') === 'true';

  if (setupCompleted || setupSkipped) {
    return next();
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return next();
    }

    // Cache the setup status check for the session
    const setupCheckKey = 'setup_status_checked';
    const sessionSetupChecked = sessionStorage.getItem(setupCheckKey);

    // If we already checked in this session and setup was complete, skip the API call
    if (sessionSetupChecked === 'complete') {
      return next();
    }

    const setupStatus = await setupApi.getStatus();

    // If setup is complete on backend, mark it locally and cache for session
    if (
      (setupStatus.currentStep as string) === SetupStep.COMPLETE ||
      !setupStatus.isFirstSetup
    ) {
      localStorage.setItem('setup_completed', 'true');
      sessionStorage.setItem(setupCheckKey, 'complete');
      return next();
    }

    if (
      setupStatus.isFirstSetup &&
      (setupStatus.currentStep as string) !== SetupStep.COMPLETE
    ) {
      if (setupStatus.isCurrentUserAdmin) {
        sessionStorage.setItem(setupCheckKey, 'in_progress');
        return next(`/setup/${setupStatus.currentStep}`);
      }
    }

    next();
  } catch {
    next();
  }
};
