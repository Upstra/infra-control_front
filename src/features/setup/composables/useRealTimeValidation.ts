import { ref } from 'vue';
import { setupApi } from '../api';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export interface ValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error?: string;
  conflictsWith?: string;
}

interface ValidationCache {
  [key: string]: {
    result: ValidationResult;
    timestamp: number;
  };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 300;

export const useRealTimeValidation = (localResources?: any[]) => {
  const cache = ref<ValidationCache>({});
  const pendingRequests = new Set<string>();

  const getCacheKey = (value: string, type?: string): string => {
    return type ? `${type}:${value}` : `ip:${value}`;
  };

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_TTL;
  };

  const getFromCache = (key: string): ValidationResult | null => {
    const cached = cache.value[key];
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.result;
    }
    return null;
  };

  const setCache = (key: string, result: ValidationResult): void => {
    cache.value[key] = {
      result,
      timestamp: Date.now(),
    };
  };

  const clearCache = (): void => {
    cache.value = {};
    pendingRequests.clear();
  };

  const checkLocalDuplicates = (
    value: string,
    type?: string,
  ): ValidationResult | null => {
    if (!localResources || !localResources.length) return null;

    if (type === 'room') {
      const duplicate = localResources.find(
        (r: any) => r.name?.toLowerCase() === value.toLowerCase(),
      );
      if (duplicate) {
        return {
          isValid: false,
          isLoading: false,
          error: `Nom déjà utilisé par ${duplicate.name}`,
          conflictsWith: duplicate.name,
        };
      }
    } else if (type === 'ups') {
      const duplicate = localResources.find(
        (r: any) => r.name?.toLowerCase() === value.toLowerCase(),
      );
      if (duplicate) {
        return {
          isValid: false,
          isLoading: false,
          error: `Nom déjà utilisé par ${duplicate.name}`,
          conflictsWith: duplicate.name,
        };
      }
    } else if (type === 'server') {
      const duplicate = localResources.find(
        (r: any) => r.name?.toLowerCase() === value.toLowerCase(),
      );
      if (duplicate) {
        return {
          isValid: false,
          isLoading: false,
          error: `Nom déjà utilisé par ${duplicate.name}`,
          conflictsWith: duplicate.name,
        };
      }
    } else {
      // IP check
      const duplicate = localResources.find(
        (r: any) => r.ip === value || r.ilo_ip === value,
      );
      if (duplicate) {
        return {
          isValid: false,
          isLoading: false,
          error: `IP déjà utilisée par ${duplicate.name || 'une autre ressource'}`,
          conflictsWith: duplicate.name,
        };
      }
    }

    return null;
  };

  const validateIp = async (ip: string): Promise<ValidationResult> => {
    if (!ip || !ip.trim()) {
      return { isValid: true, isLoading: false };
    }

    // Check local duplicates first
    const localDuplicate = checkLocalDuplicates(ip);
    if (localDuplicate) {
      return localDuplicate;
    }

    const cacheKey = getCacheKey(ip);

    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Prevent duplicate requests
    if (pendingRequests.has(cacheKey)) {
      return { isValid: true, isLoading: true };
    }

    pendingRequests.add(cacheKey);
    const result: ValidationResult = { isValid: false, isLoading: true };

    try {
      const { exists, conflictsWith } = await setupApi.validateIp(ip);

      result.isValid = !exists;
      result.isLoading = false;

      if (exists && conflictsWith) {
        result.error = `IP déjà utilisée par ${conflictsWith}`;
        result.conflictsWith = conflictsWith;
      }
    } catch {
      // Fallback: Si API fail, pas de blocage utilisateur
      result.isValid = true;
      result.isLoading = false;
    }

    pendingRequests.delete(cacheKey);
    setCache(cacheKey, result);
    return result;
  };

  const validateName = async (
    name: string,
    type: 'ups' | 'server' | 'room',
  ): Promise<ValidationResult> => {
    if (!name || !name.trim()) {
      return { isValid: true, isLoading: false };
    }

    // Check local duplicates first
    const localDuplicate = checkLocalDuplicates(name, type);
    if (localDuplicate) {
      return localDuplicate;
    }

    const cacheKey = getCacheKey(name, type);

    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Prevent duplicate requests
    if (pendingRequests.has(cacheKey)) {
      return { isValid: true, isLoading: true };
    }

    pendingRequests.add(cacheKey);
    const result: ValidationResult = { isValid: false, isLoading: true };

    try {
      const { exists, conflictsWith } = await setupApi.validateName(name, type);

      result.isValid = !exists;
      result.isLoading = false;

      if (exists && conflictsWith) {
        result.error = `Nom déjà utilisé par ${conflictsWith}`;
        result.conflictsWith = conflictsWith;
      }
    } catch {
      // Fallback: Si API fail, pas de blocage utilisateur
      result.isValid = true;
      result.isLoading = false;
    }

    pendingRequests.delete(cacheKey);
    setCache(cacheKey, result);
    return result;
  };

  // Debounced versions
  const debouncedValidateIp = debounce(validateIp, DEBOUNCE_DELAY);
  const debouncedValidateName = debounce(validateName, DEBOUNCE_DELAY);

  return {
    validateIp: debouncedValidateIp,
    validateName: debouncedValidateName,
    validateIpImmediate: validateIp,
    validateNameImmediate: validateName,
    clearCache,
  };
};
