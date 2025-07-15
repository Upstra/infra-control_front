import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface MigrationJob {
  id: string;
  sourceServerId: string;
  destinationServerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  progress: number;
  error?: string;
}

export const useMigrationStore = defineStore('migration', () => {
  const migrations = ref<MigrationJob[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const startMigration = async (
    sourceServerId: string,
    destinationServerId: string,
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Implement actual migration API call
      const migrationJob: MigrationJob = {
        id: `migration_${Date.now()}`,
        sourceServerId,
        destinationServerId,
        status: 'pending',
        startedAt: new Date(),
        progress: 0,
      };

      migrations.value.push(migrationJob);

      // Simulate migration progress
      simulateMigrationProgress(migrationJob.id);

      return migrationJob;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const simulateMigrationProgress = (migrationId: string) => {
    const migration = migrations.value.find((m) => m.id === migrationId);
    if (!migration) return;

    migration.status = 'in_progress';

    const interval = setInterval(() => {
      migration.progress += Math.random() * 10;

      if (migration.progress >= 100) {
        migration.progress = 100;
        migration.status = 'completed';
        migration.completedAt = new Date();
        clearInterval(interval);
      }
    }, 1000);
  };

  const getMigrationById = (id: string) => {
    return migrations.value.find((m) => m.id === id);
  };

  const getMigrationsByServer = (serverId: string) => {
    return migrations.value.filter(
      (m) =>
        m.sourceServerId === serverId || m.destinationServerId === serverId,
    );
  };

  return {
    migrations,
    isLoading,
    error,
    startMigration,
    getMigrationById,
    getMigrationsByServer,
  };
});
