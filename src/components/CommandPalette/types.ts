export interface CommandAction {
  group: string;
  label: string;
  description?: string;
  icon: any;
  fn: () => void;
  shortcut?: string;
  path?: string;
  onlyInUsers?: boolean;
  adminOnly?: boolean;
}
