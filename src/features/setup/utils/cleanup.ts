/**
 * Utility functions for cleaning up setup wizard data
 */

export const SETUP_STORAGE_KEYS = {
  RESOURCES: 'upstra_setup_resources',
  CURRENT_STEP: 'upstra_setup_current_step',
  COMPLETED: 'setup_completed',
  SKIPPED: 'setup_skipped',
  DISCOVERY_SESSION: 'vmware_discovery_session',
} as const;

/**
 * Clean all setup data except completion status
 */
export const cleanupSetupData = () => {
  // List of keys to remove
  const keysToRemove = [
    SETUP_STORAGE_KEYS.RESOURCES,
    SETUP_STORAGE_KEYS.CURRENT_STEP,
    SETUP_STORAGE_KEYS.DISCOVERY_SESSION,
  ];

  // Remove specific keys
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  });

  // Remove any other setup-related keys except completion status
  const allKeys = Object.keys(localStorage);
  const setupKeys = allKeys.filter(key => 
    key.startsWith('setup_') && 
    key !== SETUP_STORAGE_KEYS.COMPLETED &&
    key !== SETUP_STORAGE_KEYS.SKIPPED
  );

  setupKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  });

  // Also clear session storage setup data
  try {
    sessionStorage.removeItem('setup_status_checked');
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
};

/**
 * Mark setup as completed and clean up data
 */
export const completeSetupAndCleanup = () => {
  // Mark as completed
  try {
    localStorage.setItem(SETUP_STORAGE_KEYS.COMPLETED, 'true');
    localStorage.removeItem(SETUP_STORAGE_KEYS.SKIPPED);
  } catch (error) {
    console.error('Failed to set completion status:', error);
  }

  // Clean up all other data
  cleanupSetupData();
};

/**
 * Check if setup is completed
 */
export const isSetupCompleted = (): boolean => {
  try {
    return localStorage.getItem(SETUP_STORAGE_KEYS.COMPLETED) === 'true';
  } catch {
    return false;
  }
};

/**
 * Check if setup was skipped
 */
export const isSetupSkipped = (): boolean => {
  try {
    return localStorage.getItem(SETUP_STORAGE_KEYS.SKIPPED) === 'true' ||
           localStorage.getItem('skipSetup') === 'true';
  } catch {
    return false;
  }
};

/**
 * Skip setup and clean up data
 */
export const skipSetupAndCleanup = () => {
  try {
    // Mark as skipped (using both keys for compatibility)
    localStorage.setItem(SETUP_STORAGE_KEYS.SKIPPED, 'true');
    localStorage.setItem('skipSetup', 'true');
    localStorage.removeItem(SETUP_STORAGE_KEYS.COMPLETED);
  } catch (error) {
    console.error('Failed to set skip status:', error);
  }

  // Clean up all setup data
  cleanupSetupData();
};

/**
 * Reset setup status to allow running wizard again
 */
export const resetSetupStatus = () => {
  try {
    // Remove completion/skip flags
    localStorage.removeItem(SETUP_STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(SETUP_STORAGE_KEYS.SKIPPED);
    localStorage.removeItem('skipSetup');
    
    // Clear session cache
    sessionStorage.removeItem('setup_status_checked');
  } catch (error) {
    console.error('Failed to reset setup status:', error);
  }
  
  // Don't clean other data - user might want to continue where they left off
};