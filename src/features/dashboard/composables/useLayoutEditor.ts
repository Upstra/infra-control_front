import { computed, ref } from 'vue';
import {
  addWidget,
  cycleWidth,
  moveWidget,
  presentTypes,
  type BoardWidget,
} from '../domain/layout';
import type { PulseWidgetType } from '../domain/catalog';
import type { Board } from '../store';

const clone = (board: Board): Board => ({
  ...board,
  widgets: board.widgets.map((widget) => ({ ...widget })),
});

export const useLayoutEditor = () => {
  const draft = ref<Board | null>(null);
  const snapshot = ref<Board | null>(null);

  const editing = computed(() => draft.value !== null);
  const present = computed(() => presentTypes(draft.value?.widgets ?? []));

  const updateWidgets = (fn: (widgets: BoardWidget[]) => BoardWidget[]) => {
    if (draft.value)
      draft.value = { ...draft.value, widgets: fn(draft.value.widgets) };
  };

  const start = (board: Board) => {
    snapshot.value = clone(board);
    draft.value = clone(board);
  };

  const cancel = (): Board | null => {
    const restored = snapshot.value;
    draft.value = null;
    snapshot.value = null;
    return restored;
  };

  const finish = () => {
    draft.value = null;
    snapshot.value = null;
  };

  const rename = (name: string) => {
    if (draft.value) draft.value = { ...draft.value, name };
  };

  const move = (from: number, to: number) =>
    updateWidgets((widgets) => moveWidget(widgets, from, to));

  const reorder = (widgets: BoardWidget[]) => updateWidgets(() => widgets);

  const resize = (id: string) =>
    updateWidgets((widgets) =>
      widgets.map((widget) => (widget.id === id ? cycleWidth(widget) : widget)),
    );

  const removeWidget = (id: string) =>
    updateWidgets((widgets) => widgets.filter((widget) => widget.id !== id));

  const add = (type: PulseWidgetType) =>
    updateWidgets((widgets) => addWidget(widgets, type));

  return {
    draft,
    snapshot,
    editing,
    present,
    start,
    cancel,
    finish,
    rename,
    move,
    reorder,
    resize,
    removeWidget,
    add,
  };
};
