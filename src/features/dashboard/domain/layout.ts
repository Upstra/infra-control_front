import { generateUUID } from '@/utils/uuid';
import { WIDGET_SPECS, canonicalType, isAllowedWidth, specOf } from './catalog';
import type { PulseWidgetType, WidgetWidth } from './catalog';
import type { Widget } from '../types';

export interface BoardWidget {
  id: string;
  type: PulseWidgetType;
  title?: string;
  width: WidgetWidth;
  settings: Record<string, unknown>;
}

export const fitWidth = (type: PulseWidgetType, width: number): WidgetWidth => {
  const { widths, defaultWidth } = WIDGET_SPECS[type];
  if (widths.includes(width as WidgetWidth)) return width as WidgetWidth;
  return widths.reduce(
    (best, candidate) =>
      Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best,
    defaultWidth,
  );
};

export const fromApi = (widgets: Widget[]): BoardWidget[] =>
  [...widgets]
    .sort((a, b) => a.position.x - b.position.x)
    .flatMap((widget) => {
      const type = canonicalType(widget.type);
      if (!type) return [];
      return [
        {
          id: widget.id,
          type,
          title: widget.title,
          width: fitWidth(type, widget.position.w),
          settings: widget.settings ?? {},
        },
      ];
    });

export const toApi = (widgets: BoardWidget[]): Widget[] =>
  widgets.map((widget, rank) => {
    if (!isAllowedWidth(widget.type, widget.width)) {
      throw new RangeError(
        `width ${widget.width} not allowed for ${widget.type}`,
      );
    }
    return {
      id: widget.id,
      type: widget.type,
      title: widget.title ?? widget.type,
      position: { x: rank, y: 0, w: widget.width, h: 1 },
      settings: widget.settings,
    };
  });

export const moveWidget = (
  widgets: BoardWidget[],
  from: number,
  to: number,
): BoardWidget[] => {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= widgets.length ||
    to >= widgets.length
  ) {
    return widgets;
  }
  const next = [...widgets];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const cycleWidth = (widget: BoardWidget): BoardWidget => {
  const widths = specOf(widget.type)?.widths ?? [widget.width];
  const index = widths.indexOf(widget.width);
  return { ...widget, width: widths[(index + 1) % widths.length] };
};

export const setWidth = (widget: BoardWidget, width: number): BoardWidget => {
  if (!isAllowedWidth(widget.type, width)) {
    throw new RangeError(`width ${width} not allowed for ${widget.type}`);
  }
  return { ...widget, width: width as WidgetWidth };
};

export const createWidget = (type: PulseWidgetType): BoardWidget => ({
  id: generateUUID(),
  type,
  width: WIDGET_SPECS[type].defaultWidth,
  settings: {},
});

export const addWidget = (
  widgets: BoardWidget[],
  type: PulseWidgetType,
): BoardWidget[] =>
  widgets.some((widget) => widget.type === type)
    ? widgets
    : [...widgets, createWidget(type)];

export const presentTypes = (widgets: BoardWidget[]) =>
  new Set(widgets.map((widget) => widget.type));
