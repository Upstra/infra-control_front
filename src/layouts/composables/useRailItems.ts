import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  LayoutDashboard,
  Server,
  Layers,
  BatteryCharging,
  Group,
  ArrowRightLeft,
  History,
  Terminal,
  ScrollText,
  ShieldCheck,
  Settings,
} from 'lucide-vue-next';
import { useAuthStore } from '@/features/auth/store';
import type { RailItem, RailUser } from '@/shared/components/pulse';

export interface RailBadges {
  counts?: Partial<Record<string, number | null>>;
  critical?: Partial<Record<string, number>>;
}

export const useRailItems = (badges: () => RailBadges = () => ({})) => {
  const { t } = useI18n();
  const auth = useAuthStore();

  const isAdmin = computed(
    () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
  );

  const items = computed<RailItem[]>(() => {
    const { counts = {}, critical = {} } = badges();
    const all: (RailItem & { adminOnly?: boolean })[] = [
      {
        to: '/dashboard',
        match: ['/'],
        icon: LayoutDashboard,
        label: t('pulse.rail.dashboards'),
        section: 'operate',
      },
      {
        to: '/servers',
        icon: Server,
        label: t('pulse.rail.servers'),
        section: 'operate',
      },
      {
        to: '/rooms',
        icon: Layers,
        label: t('pulse.rail.rooms'),
        section: 'operate',
      },
      {
        to: '/ups',
        icon: BatteryCharging,
        label: t('pulse.rail.ups'),
        section: 'operate',
      },
      {
        to: '/groups',
        icon: Group,
        label: t('nav.groups'),
        section: 'operate',
      },
      {
        to: '/migration',
        icon: ArrowRightLeft,
        label: t('pulse.rail.migration'),
        section: 'operate',
        adminOnly: true,
      },
      {
        to: '/admin/history',
        icon: History,
        label: t('pulse.rail.history'),
        section: 'consult',
        adminOnly: true,
      },
      {
        to: '/logs',
        icon: Terminal,
        label: t('pulse.rail.logs'),
        section: 'consult',
      },
      {
        to: '/changelog',
        icon: ScrollText,
        label: t('nav.changelog'),
        section: 'consult',
      },
      {
        to: '/admin/users',
        match: ['/admin/roles', '/admin/settings'],
        icon: ShieldCheck,
        label: t('pulse.rail.admin'),
        section: 'settings',
        adminOnly: true,
      },
      {
        to: '/settings',
        icon: Settings,
        label: t('pulse.rail.settings'),
        section: 'settings',
      },
    ];
    return all
      .filter((item) => !item.adminOnly || isAdmin.value)
      .map(({ adminOnly: _adminOnly, ...item }) => ({
        ...item,
        count: counts[item.to] ?? null,
        critical: critical[item.to] ?? 0,
      }));
  });

  const user = computed<RailUser | null>(() =>
    auth.currentUser
      ? {
          name: auth.currentUser.username,
          role: isAdmin.value
            ? t('pulse.rail.admin_role')
            : t('pulse.rail.user_role'),
          to: '/profile',
        }
      : null,
  );

  return { items, user };
};
