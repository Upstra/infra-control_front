import { ref, computed } from 'vue';

export interface PowerOperation {
  id: string;
  type: 'server' | 'vm';
  operation: 'starting' | 'stopping';
  startedAt: number;
  expiresAt: number;
}

const OPERATION_DURATION = 4 * 60 * 1000;
const STORAGE_KEY = 'power-operations';

class PowerStateManager {
  private operations = ref<Map<string, PowerOperation>>(new Map());
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
    this.cleanupExpiredOperations();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PowerOperation[];
        this.operations.value = new Map(parsed.map((op) => [op.id, op]));
      }
    } catch (error) {
      console.error('Failed to load power operations from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.operations.value.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save power operations to storage:', error);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredOperations();
    }, 10000);
  }

  private cleanupExpiredOperations(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [id, operation] of this.operations.value) {
      if (now >= operation.expiresAt) {
        this.operations.value.delete(id);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  public startOperation(
    id: string,
    type: 'server' | 'vm',
    operation: 'starting' | 'stopping',
  ): void {
    const now = Date.now();
    const powerOperation: PowerOperation = {
      id,
      type,
      operation,
      startedAt: now,
      expiresAt: now + OPERATION_DURATION,
    };

    this.operations.value.set(id, powerOperation);
    this.saveToStorage();
  }

  public endOperation(id: string): void {
    if (this.operations.value.has(id)) {
      this.operations.value.delete(id);
      this.saveToStorage();
    }
  }

  public getOperation(id: string): PowerOperation | undefined {
    const operation = this.operations.value.get(id);
    if (operation && Date.now() >= operation.expiresAt) {
      this.operations.value.delete(id);
      this.saveToStorage();
      return undefined;
    }
    return operation;
  }

  public isInOperation(id: string): boolean {
    return this.getOperation(id) !== undefined;
  }

  public getOperationType(id: string): 'starting' | 'stopping' | null {
    const operation = this.getOperation(id);
    return operation?.operation || null;
  }

  public getAllOperations(): PowerOperation[] {
    this.cleanupExpiredOperations();
    return Array.from(this.operations.value.values());
  }

  public getRemainingTime(id: string): number {
    const operation = this.getOperation(id);
    if (!operation) return 0;

    const remaining = operation.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  public getProgress(id: string): number {
    const operation = this.getOperation(id);
    if (!operation) return 100;

    const elapsed = Date.now() - operation.startedAt;
    const progress = (elapsed / OPERATION_DURATION) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export const powerStateManager = new PowerStateManager();

export function usePowerState(id: string, type: 'server' | 'vm') {
  const isInOperation = computed(() => powerStateManager.isInOperation(id));
  const operationType = computed(() => powerStateManager.getOperationType(id));
  const progress = computed(() => powerStateManager.getProgress(id));
  const remainingTime = computed(() => powerStateManager.getRemainingTime(id));

  const startPowerOn = () => {
    powerStateManager.startOperation(id, type, 'starting');
  };

  const startPowerOff = () => {
    powerStateManager.startOperation(id, type, 'stopping');
  };

  const endOperation = () => {
    powerStateManager.endOperation(id);
  };

  return {
    isInOperation,
    operationType,
    progress,
    remainingTime,
    startPowerOn,
    startPowerOff,
    endOperation,
  };
}
