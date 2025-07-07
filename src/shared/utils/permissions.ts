export enum PermissionBit {
  READ = 1 << 0, // 1
  WRITE = 1 << 1, // 2
  DELETE = 1 << 2, // 4
  RESTART = 1 << 3, // 8
  SHUTDOWN = 1 << 4, // 16
  SNAPSHOT = 1 << 5, // 32
}

export const PermissionUtils = {
  has(bitmask: number, permission: PermissionBit): boolean {
    return (bitmask & permission) === permission;
  },

  add(bitmask: number, permission: PermissionBit): number {
    return bitmask | permission;
  },

  remove(bitmask: number, permission: PermissionBit): number {
    return bitmask & ~permission;
  },

  toggle(bitmask: number, permission: PermissionBit): number {
    return bitmask ^ permission;
  },

  getAll(): PermissionBit[] {
    return [
      PermissionBit.READ,
      PermissionBit.WRITE,
      PermissionBit.DELETE,
      PermissionBit.RESTART,
      PermissionBit.SHUTDOWN,
      PermissionBit.SNAPSHOT,
    ];
  },

  getActivePermissions(bitmask: number): PermissionBit[] {
    return PermissionUtils.getAll().filter((permission) => PermissionUtils.has(bitmask, permission));
  },

  getPermissionLabel(permission: PermissionBit): string {
    const labels: Record<PermissionBit, string> = {
      [PermissionBit.READ]: 'permission.read',
      [PermissionBit.WRITE]: 'permission.write',
      [PermissionBit.DELETE]: 'permission.delete',
      [PermissionBit.RESTART]: 'permission.restart',
      [PermissionBit.SHUTDOWN]: 'permission.shutdown',
      [PermissionBit.SNAPSHOT]: 'permission.snapshot',
    };
    return labels[permission];
  },

  getPermissionIcon(permission: PermissionBit): string {
    const icons: Record<PermissionBit, string> = {
      [PermissionBit.READ]: 'mdi-eye',
      [PermissionBit.WRITE]: 'mdi-pencil',
      [PermissionBit.DELETE]: 'mdi-delete',
      [PermissionBit.RESTART]: 'mdi-restart',
      [PermissionBit.SHUTDOWN]: 'mdi-power',
      [PermissionBit.SNAPSHOT]: 'mdi-camera',
    };
    return icons[permission];
  },
};
