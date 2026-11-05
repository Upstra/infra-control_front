import type { Component } from 'vue';

export type RailSection = 'operate' | 'consult' | 'settings';

export interface RailItem {
  to: string;
  icon: Component;
  label: string;
  section: RailSection;
  count?: number | null;
  critical?: number;
  match?: string[];
}

export interface RailUser {
  name: string;
  role: string;
  to: string;
}
