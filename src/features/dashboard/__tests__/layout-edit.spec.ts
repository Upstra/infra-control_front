import { describe, it, expect } from 'vitest';
import { toApi, setWidth, type BoardWidget } from '../domain/layout';
import { useLayoutEditor } from '../composables/useLayoutEditor';

const widget = (
  id: string,
  type: BoardWidget['type'],
  width: BoardWidget['width'],
): BoardWidget => ({
  id,
  type,
  width,
  settings: {},
});

const board = () => ({
  id: 'b1',
  name: 'Tableau principal',
  isDefault: true,
  widgets: [
    widget('a', 'kpis', 12),
    widget('b', 'ups', 8),
    widget('c', 'hosts', 4),
  ],
});

describe('layout editing', () => {
  it('rewrites ranks 0..n after a move', () => {
    const editor = useLayoutEditor();
    editor.start(board());
    editor.move(2, 0);
    const ranks = toApi(editor.draft.value!.widgets).map((w) => [
      w.id,
      w.position.x,
    ]);
    expect(ranks).toEqual([
      ['c', 0],
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('refuses a width the widget type does not allow', () => {
    expect(() => setWidth(widget('c', 'hosts', 4), 12)).toThrow(RangeError);
    expect(() => toApi([widget('a', 'kpis', 4 as 12)])).toThrow(RangeError);
  });

  it('restores the previous state on cancel', () => {
    const editor = useLayoutEditor();
    editor.start(board());
    editor.rename('Astreinte');
    editor.removeWidget('a');
    const restored = editor.cancel();
    expect(restored?.name).toBe('Tableau principal');
    expect(restored?.widgets.map((w) => w.id)).toEqual(['a', 'b', 'c']);
    expect(editor.editing.value).toBe(false);
  });
});
