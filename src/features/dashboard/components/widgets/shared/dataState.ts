export type WidgetDataState = 'loading' | 'error' | 'empty' | 'ready';

interface SourceState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const dataState = (
  source: SourceState,
  isEmpty: boolean,
): WidgetDataState => {
  if (!source.loaded && source.loading) return 'loading';
  if (!source.loaded && source.error) return 'error';
  if (!source.loaded) return 'loading';
  return isEmpty ? 'empty' : 'ready';
};
