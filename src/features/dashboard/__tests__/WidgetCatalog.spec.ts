import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WidgetCatalog from '../components/board/WidgetCatalog.vue';
import { useLayoutEditor } from '../composables/useLayoutEditor';
import { createTestI18n } from '@/test-utils/i18n';

const mountCatalog = () =>
  mount(WidgetCatalog, {
    props: {
      open: true,
      boardName: 'Tableau principal',
      present: new Set(['ups'] as const),
    },
    global: { plugins: [createTestI18n()], stubs: { Teleport: true } },
  });

describe('WidgetCatalog', () => {
  it('greys out a widget type already on the board', () => {
    const item = mountCatalog().find('[data-type="ups"]');
    expect(item.attributes('disabled')).toBeDefined();
    expect(item.find('[data-part="status"]').text()).toBe('DÉJÀ LÀ');
  });

  it('emits the type of an available widget', async () => {
    const wrapper = mountCatalog();
    await wrapper.find('[data-type="hosts"]').trigger('click');
    expect(wrapper.emitted('add')?.[0]).toEqual(['hosts']);
  });

  it('adds the widget at the end with its default width', () => {
    const editor = useLayoutEditor();
    editor.start({
      id: 'b',
      name: 'B',
      isDefault: false,
      widgets: [{ id: 'a', type: 'kpis', width: 12, settings: {} }],
    });
    editor.add('power');
    const last = editor.draft.value!.widgets.at(-1)!;
    expect(last.type).toBe('power');
    expect(last.width).toBe(6);
  });
});
