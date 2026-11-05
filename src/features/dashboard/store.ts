import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { dashboardApi } from './api';
import { fromApi, toApi, type BoardWidget } from './domain/layout';
import type { DashboardLayout } from './types';

export interface Board {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: BoardWidget[];
}

const toBoard = (layout: DashboardLayout): Board => ({
  id: layout.id,
  name: layout.name,
  isDefault: layout.isDefault,
  widgets: fromApi(layout.widgets ?? []),
});

export const useDashboardStore = defineStore('dashboard', () => {
  const boards = ref<Board[]>([]);
  const activeId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const active = computed<Board | null>(
    () =>
      boards.value.find((board) => board.id === activeId.value) ??
      boards.value[0] ??
      null,
  );

  const replace = (board: Board) => {
    boards.value = boards.value.map((item) =>
      item.id === board.id ? board : item,
    );
  };

  const load = async () => {
    loading.value = true;
    try {
      boards.value = (await dashboardApi.getLayouts()).map(toBoard);
      const preferred = boards.value.find((board) => board.isDefault);
      if (!boards.value.some((board) => board.id === activeId.value)) {
        activeId.value = preferred?.id ?? boards.value[0]?.id ?? null;
      }
      error.value = null;
    } catch (e: any) {
      error.value = e?.message ?? 'layouts';
    } finally {
      loading.value = false;
    }
  };

  const select = (id: string) => {
    activeId.value = id;
  };

  const create = async (name: string) => {
    const board = toBoard(await dashboardApi.createLayout({ name }));
    boards.value = [...boards.value, board];
    activeId.value = board.id;
    return board;
  };

  const save = async (board: Board) => {
    const saved = toBoard(
      await dashboardApi.updateLayout(board.id, {
        name: board.name,
        widgets: toApi(board.widgets),
      }),
    );
    replace(saved);
    return saved;
  };

  const remove = async (id: string) => {
    await dashboardApi.deleteLayout(id);
    boards.value = boards.value.filter((board) => board.id !== id);
    if (activeId.value === id) {
      activeId.value =
        boards.value.find((board) => board.isDefault)?.id ??
        boards.value[0]?.id ??
        null;
    }
  };

  return {
    boards,
    activeId,
    active,
    loading,
    error,
    load,
    select,
    create,
    save,
    remove,
  };
});
